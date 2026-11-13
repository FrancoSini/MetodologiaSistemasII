import sequelize from "../config/database";
import {
  Compra,
  CompraProducto,
  Producto,
  FuncionButaca,
} from "../models";
import { PRECIO_ENTRADA_2D } from "../config/precios";
import { reservarButaca, liberarReserva } from "./reservaButacaService";
import { AppError } from "../utils/AppError";
import type { MedioPago } from "../models/Compra";

interface ProductoCompra {
  productoId: number;
  cantidad: number;
}

interface EntradaCompra {
  funcionButacaId: number;
}

interface CrearCompraDatos {
  usuarioId: number;
  medioPago: MedioPago;
  productos: ProductoCompra[];
  entradas: EntradaCompra[];
}

export async function crearCompra(datos: CrearCompraDatos) {
  const { usuarioId, medioPago, productos, entradas } = datos;

  // Validaciones iniciales
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new AppError("Usuario inválido", 400);
  }

  if (!["debito", "credito", "efectivo"].includes(medioPago)) {
    throw new AppError("Medio de pago inválido", 400);
  }

  if (!Array.isArray(productos) || !Array.isArray(entradas)) {
    throw new AppError("Productos y entradas deben ser listas", 400);
  }

  if (productos.length === 0 && entradas.length === 0) {
    throw new AppError("La compra no puede estar vacía", 400);
  }

  // Calculamos el precio de los productos consultando la base de datos.
  const compraCreada = await sequelize.transaction(async (t) => {
    let totalProductos = 0;

    const detallesProductos = [];

    for (const item of productos) {
      if (
        !Number.isInteger(item.productoId) ||
        item.productoId <= 0 ||
        !Number.isInteger(item.cantidad) ||
        item.cantidad <= 0
      ) {
        throw new AppError("Producto o cantidad inválida", 400);
      }

      const producto = await Producto.findByPk(item.productoId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!producto) {
        throw new AppError(
          `No existe el producto ${item.productoId}`,
          404
        );
      }

      if (producto.stock < item.cantidad) {
        throw new AppError(
          `Stock insuficiente para ${producto.nombre}`,
          409
        );
      }

      const precioUnitario = Number(producto.precio);

      totalProductos += precioUnitario * item.cantidad;

      detallesProductos.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario,
      });
    }

    const totalEntradas = entradas.length * PRECIO_ENTRADA_2D;
    const total = Number((totalProductos + totalEntradas).toFixed(2));

    const compra = await Compra.create(
      {
        usuarioId,
        medioPago,
        total,
        estado: "pendiente",
      },
      { transaction: t }
    );

    if (detallesProductos.length > 0) {
      await CompraProducto.bulkCreate(
        detallesProductos.map((detalle) => ({
          compraId: compra.id,
          ...detalle,
        })),
        { transaction: t }
      );
    }

    return compra;
  });

  // Reservamos las butacas una vez creada la comprra
  const reservasRealizadas: {
    funcionId: number;
    funcionButacaId: number;
  }[] = [];

  try {
    for (const entrada of entradas) {
      if (
        !Number.isInteger(entrada.funcionButacaId) ||
        entrada.funcionButacaId <= 0
      ) {
        throw new AppError("Butaca inválida", 400);
      }

      const funcionButaca = await FuncionButaca.findByPk(
        entrada.funcionButacaId
      );

      if (!funcionButaca) {
        throw new AppError("Butaca de función no encontrada", 404);
      }

      await reservarButaca(
        funcionButaca.funcionId,
        funcionButaca.id,
        compraCreada.id
      );

      reservasRealizadas.push({
        funcionId: funcionButaca.funcionId,
        funcionButacaId: funcionButaca.id,
      });
    }
  } catch (error) {
    // Si falla alguna reserva, liberamos las anteriores.
    for (const reserva of reservasRealizadas) {
      try {
        await liberarReserva(
          reserva.funcionId,
          reserva.funcionButacaId,
          compraCreada.id
        );
      } catch {
        
      }
    }

    await compraCreada.update({ estado: "cancelada" });

    throw error;
  }

  return compraCreada;
}
