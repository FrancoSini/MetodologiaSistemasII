import { Request, Response } from "express";
import * as productoService from "../services/productoService";
import { obtenerId } from "../utils/params";

// GET /api/productos
export const obtenerProductos = async (_req: Request, res: Response) => {
  const productos = await productoService.obtenerProductos();
  return res.status(200).json(productos);
};

// GET /api/productos/:id
export const obtenerProductoPorId = async (req: Request, res: Response) => {
  const id = obtenerId(req.params.id);
  const producto = await productoService.obtenerProductoPorId(id);
  return res.status(200).json(producto);
};

// POST /api/productos
export const crearProducto = async (req: Request, res: Response) => {
  const { nombre, precio, stock, categoria } = req.body;
  const producto = await productoService.crearProducto({
    nombre,
    precio,
    stock,
    categoria,
  });
  return res.status(201).json(producto);
};

// PUT /api/productos/:id
export const actualizarProducto = async (req: Request, res: Response) => {
  const id = obtenerId(req.params.id);
  const productoActualizado = await productoService.actualizarProducto(
    id,
    req.body
  );
  return res.status(200).json(productoActualizado);
};

// DELETE /api/productos/:id
export const eliminarProducto = async (req: Request, res: Response) => {
  const id = obtenerId(req.params.id);
  await productoService.eliminarProducto(id);
  return res.status(204).send();
};