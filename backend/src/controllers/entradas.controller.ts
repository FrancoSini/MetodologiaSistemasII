
import { Request, Response } from "express";

// GET /api/entradas
export const obtenerEntradas = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Obtener entradas: a implementar",
  });
};

// GET 
// /api/entradas/:id
export const obtenerEntradaPorId = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Obtener entrada por ID: a implementar",
  });
};

// POST /api/entradas
export const crearEntrada = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Crear entrada: a implementar",
  });
};

