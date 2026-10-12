
import { Request, Response } from "express";

// GET /api/productos
export const obtenerProductos = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Obtener productos: a implementar",
  });
};





// GET /api/productos/:id
export const obtenerProductoPorId = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Obtener producto por ID: a implementar",
  });
};

// POST /api/productos
export const crearProducto = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Crear producto: a implementar",
  });
};
