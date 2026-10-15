import { Request, Response } from "express";
import Entrada from "../models/Entrada";
import { AppError } from "../utils/AppError";

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
export const crearEntrada = async (req: Request, res: Response) => {
  const { compraId, funcionButacaId, codigo } = req.body;

  if (
    !Number.isInteger(compraId) ||
    compraId <= 0 ||
    !Number.isInteger(funcionButacaId) ||
    funcionButacaId <= 0 ||
    typeof codigo !== "string" ||
    codigo.trim() === ""
  ) {
    throw new AppError("Los datos de la entrada son inválidos", 400);
  }

  try {
    const entrada = await Entrada.create({
      compraId,
      funcionButacaId,
      codigo: codigo.trim(),
    });

    return res.status(201).json(entrada);
  } catch (error: any) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new AppError("La compra o la butaca indicada no existe", 400);
    }

    throw error;
  }
};
