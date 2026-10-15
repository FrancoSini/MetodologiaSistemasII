
import { Router } from "express";
import * as comprasController from "../controllers/compras.controller";


import { asyncHandler } from "../utils/asyncHandler";



const router = Router();

// Obtener todas las compras
router.get("/", comprasController.obtenerCompras);

// Obtener una compra por ID
router.get("/:id", comprasController.obtenerCompraPorId);

// Registrar una compra
router.post("/", comprasController.crearCompra);

export default router;


