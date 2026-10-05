import { NextFunction, Request, Response } from "express";
import { ValidationError, UniqueConstraintError } from "sequelize";
import { AppError } from "../utils/AppError";

// 404 para cualquier ruta que no exista
export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// Manejo centralizado de errores: TODA respuesta de error sale con el mismo formato
// { error: { mensaje, detalles? } }
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { mensaje: err.message } });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: { mensaje: "El recurso ya existe", detalles: err.errors.map((e) => e.message) },
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: { mensaje: "Datos inválidos", detalles: err.errors.map((e) => e.message) },
    });
  }

  // JSON mal formado en el body (lo lanza express.json())
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: { mensaje: "El body no es un JSON válido" } });
  }

  console.error("Error no controlado:", err);
  return res.status(500).json({ error: { mensaje: "Error interno del servidor" } });
}