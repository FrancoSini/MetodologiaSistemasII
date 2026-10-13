import { Request, Response } from "express";
import Compra from "../models/Compra";

// GET /api/compras
export const obtenerCompras = async (req: Request, res: Response) => {
  try {
    const compras = await Compra.findAll();

    return res.status(200).json(compras);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener las compras",
    });
  }
};

// GET /api/compras/:id
export const obtenerCompraPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El ID debe ser un número entero positivo",
      });
    }

    const compra = await Compra.findByPk(id);

    if (!compra) {
      return res.status(404).json({
        mensaje: "Compra no encontrada",
      });
    }

    return res.status(200).json(compra);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener la compra",
    });
  }
};

// POST /api/compras
export const crearCompra = async (req: Request, res: Response) => {
  try {
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
      return res.status(400).json({
        mensaje: "Los datos de la compra son inválidos",
      });
    }

    const compra = await Compra.create({
      usuarioId,
      medioPago,
      total,
    });

    return res.status(201).json(compra);
  } catch (error: any) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        mensaje: "El usuario indicado no existe",
      });
    }

    return res.status(500).json({
      mensaje: "Error al crear la compra",
    });
  }
};

