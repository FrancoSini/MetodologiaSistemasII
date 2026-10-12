
import { Request, Response } from "express";

// GET 
// /api/compras
export const obtenerCompras = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Obtener compras: a implementar",
  });
};

// GET 
// 
//api/compras/:id
export const obtenerCompraPorId = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Obtener compra por ID: a implementar",
  });
};



// POST /api/compras
export const crearCompra = (req: Request, res: Response) => {
  res.status(501).json({
    mensaje: "Crear compra: a implementar",
  });
};
