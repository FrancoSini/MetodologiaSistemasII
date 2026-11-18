
import { randomUUID } from "crypto";
import sequelize from "../config/database";
import {
  Compra,
  CompraProducto,
  Producto,
  ReservaButaca,
  FuncionButaca,
} from "../models";
import { PaymentFactory } from "./pagos/PaymentFactory";
import { emitirEntrada } from "./entradaService";
import { AppError } from "../utils/AppError";
import type { Transaction } from "sequelize";

interface ProcesarPagoDatos {
  compraId: number;
  usuarioId: number;
  simularRechazo?: boolean;
}

interface DescuentoStock {
  producto: Producto;
  cantidad: number;
}

// Verifica el stock actual y bloquea los productos
// involucrados durante la transacción.
async function prepararDescuentoStock(
  compraId: number,
  transaction: Transaction
): Promise<DescuentoStock[]> {
  const detalles = await CompraProducto.findAll({
    where: { compraId },
    transaction,
  });

  // Agrupamos cantidades por producto para evitar
  // validaciones incorrectas si hay líneas repetidas.
  const cantidades = new Map<number, number>();

  for (const detalle of detalles) {
    if (
      !Number.isInteger(detalle.cantidad) ||
      detalle.cantidad <= 0
    ) {
      throw new AppError(
        "Cantidad de producto inválida",
        400
      );
    }

    cantidades.set(
      detalle.productoId,
      (cantidades.get(detalle.productoId) ?? 0) +
        detalle.cantidad
    );
  }

  const descuentos: DescuentoStock[] = [];

  // Orden consistente de bloqueos.
  const productosIds = [...cantidades.keys()].sort(
    (a, b) => a - b
  );

  for (const productoId of productosIds) {
    const producto = await Producto.findByPk(productoId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!producto) {
      throw new AppError(
        `Producto ${productoId} no encontrado`,
        404
      );
    }

    const cantidad = cantidades.get(productoId)!;

    if (producto.stock < cantidad) {
      throw new AppError(
        `Stock insuficiente para ${producto.nombre}`,
        409
      );
    }

    descuentos.push({ producto, cantidad });
  }

  return descuentos;
}

// Descuenta las existencias dentro de la transacción.
async function descontarStock(
  descuentos: DescuentoStock[],
  transaction: Transaction
): Promise<void> {
  for (const { producto, cantidad } of descuentos) {
    await producto.update(
      { stock: producto.stock - cantidad },
      { transaction }
    );
  }
}

export async function procesarPago(
  datos: ProcesarPagoDatos
) {
  const {
    compraId,
    usuarioId,
    simularRechazo = false,
  } = datos;

  if (!Number.isInteger(compraId) || compraId <= 0) {
    throw new AppError("ID de compra inválido", 400);
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new AppError("Usuario inválido", 400);
  }

  if (
    simularRechazo &&
    process.env.NODE_ENV === "production"
  ) {
    throw new AppError(
      "No se puede simular un rechazo en producción",
      403
    );
  }

  return sequelize.transaction(async (t) => {
    const compra = await Compra.findOne({
      where: { id: compraId, usuarioId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!compra) {
      throw new AppError("Compra no encontrada", 404);
    }

    if (compra.estado !== "pendiente") {
      throw new AppError(
        "La compra no está pendiente de pago",
        409
      );
    }

    // Validamos la disponibilidad actual antes de
    // procesar un pago potencialmente aprobado.
    // El bloqueo permanece hasta terminar la transacción.
    const descuentos = await prepararDescuentoStock(
      compra.id,
      t
    );

    const estrategia = PaymentFactory.obtenerEstrategia(
      compra.medioPago
    );

    const resultadoPago = await estrategia.procesarPago(
      Number(compra.total),
      simularRechazo
    );

    if (!resultadoPago.aprobado) {
      // Se rechaza el pago sin descontar productos.
      const reservas = await ReservaButaca.findAll({
        where: {
          compraId: compra.id,
          estado: "activa",
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const ahora = new Date();

      for (const reserva of reservas) {
        const funcionButaca =
          await FuncionButaca.findByPk(
            reserva.funcionButacaId,
            {
              transaction: t,
              lock: t.LOCK.UPDATE,
            }
          );

        reserva.estado =
          reserva.venceEn <= ahora
            ? "vencida"
            : "liberada";

        await reserva.save({ transaction: t });

        if (
          funcionButaca &&
          funcionButaca.estado === "reservada"
        ) {
          await funcionButaca.update(
            { estado: "disponible" },
            { transaction: t }
          );
        }
      }

      await compra.update(
        { estado: "cancelada" },
        { transaction: t }
      );

      return {
        aprobado: false,
        mensaje: resultadoPago.mensaje,
        compra,
      };
    }

    // Pago aprobado: descontamos productos y
    // confirmamos la compra en la misma transacción.
    await descontarStock(descuentos, t);

    await compra.update(
      { estado: "confirmada" },
      { transaction: t }
    );

    // Conservamos el flujo existente de entradas.
    const reservas = await ReservaButaca.findAll({
      where: {
        compraId: compra.id,
        estado: "activa",
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    for (const reserva of reservas) {
      await emitirEntrada(
        {
          compraId: compra.id,
          funcionButacaId: reserva.funcionButacaId,
          codigo: randomUUID(),
        },
        t
      );
    }

    return {
      aprobado: true,
      mensaje: resultadoPago.mensaje,
      compra,
      entradasEmitidas: reservas.length,
    };
  });
}
