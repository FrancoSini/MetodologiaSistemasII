
import { randomUUID } from "crypto";
import sequelize from "../config/database";
import {
  Compra,
  ReservaButaca,
  FuncionButaca,
} from "../models";
import { PaymentFactory } from "./pagos/PaymentFactory";
import { emitirEntrada } from "./entradaService";
import { AppError } from "../utils/AppError";

interface ProcesarPagoDatos {
  compraId: number;
  usuarioId: number;
  simularRechazo?: boolean;
}

export async function procesarPago(datos: ProcesarPagoDatos) {
  const { compraId, usuarioId, simularRechazo = false } = datos;

  if (!Number.isInteger(compraId) || compraId <= 0) {
    throw new AppError("ID de compra inválido", 400);
  }

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new AppError("Usuario inválido", 400);
  }

  // La simulación de rechazo solamente está permitida
  // en entornos distintos de producción.
  if (simularRechazo && process.env.NODE_ENV === "production") {
    throw new AppError("No se puede simular un rechazo en producción", 403);
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
      throw new AppError("La compra no está pendiente de pago", 409);
    }

    // Seleccionamos la estrategia según el medio de pago.
    const estrategia = PaymentFactory.obtenerEstrategia(compra.medioPago);

    const resultadoPago = await estrategia.procesarPago(
      Number(compra.total),
      simularRechazo
    );

    // Si el pago es rechazado, cancelamos la compra
    // y liberamos las reservas de sus butacas.
    if (!resultadoPago.aprobado) {
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
        const funcionButaca = await FuncionButaca.findByPk(
          reserva.funcionButacaId,
          {
            transaction: t,
            lock: t.LOCK.UPDATE,
          }
        );

        reserva.estado =
          reserva.venceEn <= ahora ? "vencida" : "liberada";

        await reserva.save({ transaction: t });

        if (funcionButaca && funcionButaca.estado === "reservada") {
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

    // Si el pago se aprueba, confirmamos la compra.
    await compra.update(
      { estado: "confirmada" },
      { transaction: t }
    );

    // Recuperamos las reservas activas para emitir las entradas.
    const reservas = await ReservaButaca.findAll({
      where: {
        compraId: compra.id,
        estado: "activa",
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // Cada entrada se emite dentro de la misma transacción.
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


