import { Request, Response, NextFunction } from "express";
import { Funcion, Pelicula, Sala } from "../models";
import {
  crearFuncionConValidacion,
  obtenerButacasDeFuncion,
  actualizarHorarioFuncion,
  cancelarFuncion,
} from "../services/funcionService";
import { obtenerId } from "../utils/params";
import { AppError } from "../utils/AppError";


// Obtener todas las funciones (incluyendo los datos de su película y sala asociada)
export async function getFunciones(req: Request, res: Response, next: NextFunction) {
    try {
        const funciones = await Funcion.findAll({
        include: [Pelicula, Sala],
        });
        return res.json(funciones);
    } catch (error) {
        next(error);
    }
    }

    // Obtener una función específica por su ID
    export async function getFuncionById(req: Request, res: Response, next: NextFunction) {
    try {
        const funcion = await Funcion.findByPk(obtenerId(req.params.id), {
        include: [Pelicula, Sala],
        });

        if (!funcion) {
        return res.status(404).json({ error: { mensaje: "Función no encontrada" } });
        }

        return res.json(funcion);
    } catch (error) {
        next(error);
    }
}

// Crear una función y generar automáticamente sus butacas para la venta (transaccional)

export async function createFuncion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { peliculaId, salaId, fecha, hora } = req.body ?? {};

    const nuevaFuncion = await crearFuncionConValidacion({
      peliculaId,
      salaId,
      fecha,
      hora,
    });

    return res.status(201).json(nuevaFuncion);
  } catch (error) {
    next(error);
  }
}


export async function getButacasDeFuncion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const funcionId = obtenerId(req.params.id);

    const butacas = await obtenerButacasDeFuncion(funcionId);

    return res.status(200).json(butacas);
  } catch (error) {
    next(error);
  }
}

export async function updateFuncion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = obtenerId(req.params.id);
    const datos = req.body;

    if (
      !datos ||
      typeof datos !== "object" ||
      Array.isArray(datos)
    ) {
      throw new AppError("Datos inválidos", 400);
    }

    const campos = Object.keys(datos);

    if (
      campos.length === 0 ||
      campos.some(
        (campo) => !["fecha", "hora"].includes(campo)
      )
    ) {
      throw new AppError(
        "Solo se permite modificar fecha y hora",
        400
      );
    }

    const { fecha, hora } = datos;

    if (
      (fecha !== undefined && typeof fecha !== "string") ||
      (hora !== undefined && typeof hora !== "string")
    ) {
      throw new AppError("Fecha u hora inválida", 400);
    }

    const funcion = await actualizarHorarioFuncion(id, {
      fecha,
      hora,
    });

    return res.status(200).json(funcion);
  } catch (error) {
    next(error);
  }
}

export async function cancelFuncion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = obtenerId(req.params.id);

    const funcion = await cancelarFuncion(id);

    return res.status(200).json(funcion);
  } catch (error) {
    next(error);
  }
}
