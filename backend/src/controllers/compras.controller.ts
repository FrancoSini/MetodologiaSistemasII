// clean code usando error handler 



import { Request, Response } from "express";
import Compra from "../models/Compra";
import { AppError } from "../utils/AppError";

// GET /api/compras
export const obtenerCompras = async (req: Request, res: Response) => {
  const compras = await Compra.findAll();
  return res.status(200).json(compras);
};

// GET /api/compras/:id
export const obtenerCompraPorId = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("El ID debe ser un número entero positivo", 400);
  }

  const compra = await Compra.findByPk(id);

  if (!compra) {
    throw new AppError("Compra no encontrada", 404);
  }

  return res.status(200).json(compra);
};

// POST /api/compras
export const crearCompra = async (req: Request, res: Response) => {
  const { usuarioId, medioPago, total } = req.body;

  const mediosPagoValidos = ["debito", "credito", "efectivo"];

  if (
    !Number.isInteger(usuarioId) ||
    usuarioId <= 0 ||
    !mediosPagoValidos.includes(medioPago) ||
    typeof total !== "number" ||
    !Number.isFinite(total) ||
    total < 0
  ) {
    throw new AppError("Los datos de la compra son inválidos", 400);
  }

  try {
    const compra = await Compra.create({
      usuarioId,
      medioPago,
      total,
    });

    return res.status(201).json(compra);
  } catch (error: any) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new AppError("El usuario indicado no existe", 400);
    }

    throw error;
  }
};

