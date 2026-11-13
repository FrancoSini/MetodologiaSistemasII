import { Request, Response } from "express";
import { authRequest } from "../middlewares/auth";
import Compra from "../models/Compra";
import { crearCompra as crearCompraService } from "../services/compraService";
import { AppError } from "../utils/AppError";

import { procesarPago } from "../services/pagoService";

// GET /api/compras
export const obtenerCompras = async (req: Request, res: Response) => {
  const compras = await Compra.findAll();
  return res.status(200).json(compras);
};

// GET / api/compras/:id

export const obtenerCompraPorId = async (req: Request, res: Response) => {
  const usuarioAutenticado = (req as authRequest).usuario;

  if (!usuarioAutenticado) {
    throw new AppError("Usuario no autenticado", 401);
  }

  const usuarioId = Number(usuarioAutenticado.uid);
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("El ID debe ser un número entero positivo", 400);
  }

  const compra = await Compra.findOne({
    where: { id, usuarioId },
  });

  if (!compra) {
    throw new AppError("Compra no encontrada", 404);
  }

  return res.status(200).json(compra);
};


// POST /api/compras
export const crearCompra = async (req: Request, res: Response) => {
  const usuarioAutenticado = (req as authRequest).usuario;

  if (!usuarioAutenticado) {
    throw new AppError("Usuario no autenticado", 401);
  }

  const usuarioId = Number(usuarioAutenticado.uid);
  const { medioPago, productos, entradas } = req.body;

  const compra = await crearCompraService({
    usuarioId,
    medioPago,
    productos,
    entradas,
  });

  return res.status(201).json({
    mensaje: "Compra creada correctamente. Pendiente de pago.",
    compra,
  });
};




export const obtenerMisCompras = async (req: Request, res: Response) => {
  const usuarioAutenticado = (req as authRequest).usuario;

  if (!usuarioAutenticado) {
    throw new AppError("Usuario no autenticado", 401);
  }

  const usuarioId = Number(usuarioAutenticado.uid);

  const compras = await Compra.findAll({
    where: { usuarioId },
    order: [["fecha", "DESC"]],
  });

  return res.status(200).json(compras);
};



export const pagarCompra = async (req: Request, res: Response) => {
  const usuarioAutenticado = (req as authRequest).usuario;

  if (!usuarioAutenticado) {
    throw new AppError("Usuario no autenticado", 401);
  }

  const usuarioId = Number(usuarioAutenticado.uid);
  const compraId = Number(req.params.id);

  const { simularRechazo = false } = req.body;

  if (typeof simularRechazo !== "boolean") {
    throw new AppError("simularRechazo debe ser un valor booleano", 400);
  }

  const resultado = await procesarPago({
    compraId,
    usuarioId,
    simularRechazo,
  });

  return res.status(200).json(resultado);
};
