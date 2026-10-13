
import { Request, Response } from "express";
import Entrada from "../models/Entrada";

// GET /api/entradas
export const obtenerEntradas = async (req: Request, res: Response) => {
  try {
    const entradas = await Entrada.findAll();

    return res.status(200).json(entradas);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener las entradas",
    });
  }
};

// GET /api/entradas/:id
export const obtenerEntradaPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El ID debe ser un número entero positivo",
      });
    }

    const entrada = await Entrada.findByPk(id);

    if (!entrada) {
      return res.status(404).json({
        mensaje: "Entrada no encontrada",
      });
    }

    return res.status(200).json(entrada);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener la entrada",
    });
  }
};

// POST /api/entradas
export const crearEntrada = async (req: Request, res: Response) => {
  try {
    const { compraId, funcionButacaId, codigo } = req.body;

    if (
      !Number.isInteger(compraId) ||
      compraId <= 0 ||
      !Number.isInteger(funcionButacaId) ||
      funcionButacaId <= 0 ||
      typeof codigo !== "string" ||
      codigo.trim() === ""
    ) {
      return res.status(400).json({
        mensaje: "Los datos de la entrada son inválidos",
      });
    }

    const entrada = await Entrada.create({
      compraId,
      funcionButacaId,
      codigo: codigo.trim(),
    });

    return res.status(201).json(entrada);
  } catch (error: any) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        mensaje: "La butaca ya tiene una entrada asociada o el código ya existe",
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        mensaje: "La compra o la butaca indicada no existe",
      });
    }

    return res.status(500).json({
      mensaje: "Error al crear la entrada",
    });
  }
};


