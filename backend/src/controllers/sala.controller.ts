import { Request, Response } from "express";
import * as salaService from "../services/salaService";
import { obtenerId } from "../utils/params";
import { AppError } from "../utils/AppError";

// El controller solo traduce HTTP: lee la petición, llama al servicio y arma la respuesta.
// Las reglas de negocio y la transacción viven en el servicio; los errores los maneja el errorHandler.

// GET /api/salas
export async function obtenerSalas(_req: Request, res: Response) {
  const salas = await salaService.obtenerSalas();
  return res.json(salas);
}

// GET /api/salas/:id
export async function obtenerSalaPorId(req: Request, res: Response) {
  const sala = await salaService.obtenerSalaPorId(obtenerId(req.params.id));
  return res.json(sala);
}

// POST /api/salas
export async function crearSala(req: Request, res: Response) {
  const { nombre, filas, butacasPorFila } = req.body;
  const sala = await salaService.crearSala({ nombre, filas, butacasPorFila });
  return res.status(201).json(sala);
}

export async function actualizarSala(req: Request, res: Response) {
  const id = obtenerId(req.params.id);

  const datos = req.body;

  if (
    !datos ||
    typeof datos !== "object" ||
    Array.isArray(datos) ||
    Object.keys(datos).length !== 1 ||
    !Object.prototype.hasOwnProperty.call(datos, "nombre")
  ) {
    throw new AppError(
      "Solo se permite actualizar el nombre de la sala",
      400
    );
  }

  const sala = await salaService.actualizarSala(
    id,
    datos.nombre
  );

  return res.status(200).json(sala);
}

export async function eliminarSala(req: Request, res: Response) {
  const id = obtenerId(req.params.id);

  await salaService.eliminarSala(id);

  return res.status(204).send();
}
