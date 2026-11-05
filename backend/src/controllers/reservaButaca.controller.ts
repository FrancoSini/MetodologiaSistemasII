
import { Request, Response, NextFunction } from "express";
import {
  reservarButaca,
  liberarReserva,
} from "../services/reservaButacaService";
import { obtenerId } from "../utils/params";
import { AppError } from "../utils/AppError";

// POST /api/funciones/:id/butacas/:butacaId/reservar
export async function reservar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const funcionId = obtenerId(req.params.id);
    const funcionButacaId = obtenerId(req.params.butacaId);
    const { compraId } = req.body ?? {};

    if (!Number.isInteger(compraId) || compraId <= 0) {
      throw new AppError("El ID de compra es inválido", 400);
    }

    const reserva = await reservarButaca(
      funcionId,
      funcionButacaId,
      compraId
    );

    return res.status(201).json(reserva);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/funciones/:id/butacas/:butacaId/liberar
export async function liberar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const funcionId = obtenerId(req.params.id);
    const funcionButacaId = obtenerId(req.params.butacaId);
    const { compraId } = req.body ?? {};

    if (!Number.isInteger(compraId) || compraId <= 0) {
      throw new AppError("El ID de compra es inválido", 400);
    }

    const reserva = await liberarReserva(
      funcionId,
      funcionButacaId,
      compraId
    );

    return res.status(200).json(reserva);
  } catch (error) {
    next(error);
  }
}
