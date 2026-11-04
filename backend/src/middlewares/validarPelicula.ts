
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

// Comprueba que el valor sea un texto no vacío.
const esTextoValido = (valor: unknown): valor is string => {
  return typeof valor === "string" && valor.trim().length > 0;
};

// Comprueba que la duración sea un entero positivo.
const esDuracionValida = (valor: unknown): valor is number => {
  return Number.isInteger(valor) && (valor as number) > 0;
};

// Verifica que un campo opcional sea una URL HTTP(S) o null.
const esUrlValida = (valor: unknown): boolean => {
  if (valor === undefined || valor === null) {
    return true;
  }

  if (typeof valor !== "string") {
    return false;
  }

  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// Valida la estructura de los datos al crear una película.
export const validarCrearPelicula = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const {
    titulo,
    genero,
    duracionMinutos,
    clasificacion,
    sinopsis,
    posterUrl,
    trailerUrl,
    esProximoEstreno,
  } = req.body ?? {};

  if (
    !esTextoValido(titulo) ||
    !esTextoValido(genero) ||
    !esDuracionValida(duracionMinutos) ||
    !esTextoValido(clasificacion) ||
    !esTextoValido(sinopsis) ||
    !esUrlValida(posterUrl) ||
    !esUrlValida(trailerUrl) ||
    (esProximoEstreno !== undefined &&
      typeof esProximoEstreno !== "boolean")
  ) {
    throw new AppError(
      "Los datos de la película son inválidos",
      400
    );
  }

  next();
};
