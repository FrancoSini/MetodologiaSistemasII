import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const validarProducto = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { nombre, precio, stock, categoria } = req.body;

  if (
    typeof nombre !== "string" ||
    nombre.trim() === "" ||
    typeof categoria !== "string" ||
    categoria.trim() === "" ||
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    throw new AppError("Los datos del producto son inválidos", 400);
  }

  next();
};