
import { Request, Response } from "express";
import Producto from "../models/Producto";
import { AppError } from "../utils/AppError";

// GET /api/productos
export const obtenerProductos = async (req: Request, res: Response) => {
  const productos = await Producto.findAll();
  return res.status(200).json(productos);
};

// GET /api/productos/:id
export const obtenerProductoPorId = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("El ID debe ser un número entero positivo", 400);
  }

  const producto = await Producto.findByPk(id);

  if (!producto) {
    throw new AppError("Producto no encontrado", 404);
  }

  return res.status(200).json(producto);
};

// POST /api/productos
export const crearProducto = async (req: Request, res: Response) => {
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

  const producto = await Producto.create({
    nombre: nombre.trim(),
    precio,
    stock,
    categoria: categoria.trim(),
  });

  return res.status(201).json(producto);
};
