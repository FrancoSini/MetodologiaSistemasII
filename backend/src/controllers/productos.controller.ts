
import { Request, Response } from "express";
import Producto from "../models/Producto";  

// GET /api/productos
export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const productos = await Producto.findAll();
    return res.status(200).json(productos);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener los productos",
    });
  }
};

// GET /api/productos/:id
export const obtenerProductoPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El ID debe ser un número entero positivo",
      });
    }

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
      });
    }

    return res.status(200).json(producto);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener el producto",
    });
  }
};

// POST /api/productos
export const crearProducto = async (req: Request, res: Response) => {
  try {
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
      return res.status(400).json({
        mensaje: "Los datos del producto son inválidos",
      });
    }

    const producto = await Producto.create({
      nombre: nombre.trim(),
      precio,
      stock,
      categoria: categoria.trim(),
    });

    return res.status(201).json(producto);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al crear el producto",
    });
  }
};


