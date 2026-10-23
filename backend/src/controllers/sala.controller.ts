import { Request, Response } from "express";
import * as salaService from "../services/salaService";
import { obtenerId } from "../utils/params";

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