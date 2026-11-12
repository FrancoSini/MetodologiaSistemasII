import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const esTextoValido = (valor: unknown): valor is string => {
  return typeof valor === "string" && valor.trim().length > 0;
};

const esPrecioValido = (valor: unknown): valor is number => {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= 0;
};

const esStockValido = (valor: unknown): valor is number => {
  return Number.isInteger(valor) && (valor as number) >= 0;
};

export const validarProducto = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { nombre, precio, stock, categoria } = req.body ?? {};

  if (
    !esTextoValido(nombre) ||
    !esTextoValido(categoria) ||
    !esPrecioValido(precio) ||
    !esStockValido(stock)
  ) {
    throw new AppError("Los datos del producto son inválidos", 400);
  }

  next();
};

export const validarActualizarProducto = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const datos = req.body;

  if (
    !datos ||
    typeof datos !== "object" ||
    Array.isArray(datos) ||
    Object.keys(datos).length === 0
  ) {
    throw new AppError("Debe enviar al menos un campo para actualizar", 400);
  }

  const camposPermitidos = ["nombre", "precio", "stock", "categoria"];

  for (const [campo, valor] of Object.entries(datos)) {
    if (!camposPermitidos.includes(campo)) {
      throw new AppError(`Campo no permitido: ${campo}`, 400);
    }

    if ((campo === "nombre" || campo === "categoria") && !esTextoValido(valor)) {
      throw new AppError(`${campo} debe ser un texto válido`, 400);
    }

    if (campo === "precio" && !esPrecioValido(valor)) {
      throw new AppError("El precio debe ser un número mayor o igual a 0", 400);
    }

    if (campo === "stock" && !esStockValido(valor)) {
      throw new AppError("El stock debe ser un entero mayor o igual a 0", 400);
    }
  }

  next();
};