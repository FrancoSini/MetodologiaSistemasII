import { Request, Response } from "express";
import Entrada from "../models/Entrada";
import { AppError } from "../utils/AppError";
import { emitirEntrada } from "../services/entradaService";
import { Compra } from "../models";
import { authRequest } from "../middlewares/auth";
// GET /api/entradas
export const obtenerEntradas = async (req: Request, res: Response) => {
  const entradas = await Entrada.findAll();
  return res.status(200).json(entradas);
};


export const obtenerEntradaPorId = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("El ID debe ser un número entero positivo", 400);
  }

  const entrada = await Entrada.findByPk(id);

  if (!entrada) {
    throw new AppError("Entrada no encontrada", 404);
  }

  return res.status(200).json(entrada);
};

// POST /api/entradas

export const crearEntrada = async (
  req: Request,
  res: Response
) => {
  const { compraId, funcionButacaId, codigo } = req.body ?? {};

  const entrada = await emitirEntrada({
    compraId,
    funcionButacaId,
    codigo,
  });

  return res.status(201).json(entrada);
};

export const obtenerMisEntradas = async (
  req: Request,
  res: Response
) => {
  const usuario = (req as authRequest).usuario;

  if (!usuario) {
    throw new AppError("Usuario no autenticado", 401);
  }

  const usuarioId = Number(usuario.uid);

  const entradas = await Entrada.findAll({
    include: [
      {
        model: Compra,
        where: { usuarioId, estado: "confirmada" },
        required: true,
        attributes: [],
      },
    ],
    order: [["fechaEmision", "DESC"]],
  });

  return res.status(200).json(entradas);
};
