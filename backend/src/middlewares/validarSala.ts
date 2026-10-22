import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const esEnteroPositivo = (valor: unknown) => Number.isInteger(valor) && (valor as number) > 0;

// Valida la FORMA de los datos de entrada antes de llegar al controller.
// Las reglas de negocio (por ejemplo, el máximo de filas) las aplica el servicio.
export const validarCrearSala = (req: Request, _res: Response, next: NextFunction) => {
  const { nombre, filas, butacasPorFila } = req.body ?? {};

  if (
    typeof nombre !== "string" ||
    nombre.trim() === "" ||
    !esEnteroPositivo(filas) ||
    !esEnteroPositivo(butacasPorFila)
  ) {
    throw new AppError(
      "Los datos de la sala son inválidos: se requiere nombre, filas y butacasPorFila (enteros positivos)",
      400
    );
  }

  next();
};