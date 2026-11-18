
import { Router } from "express";
import * as comprasController from "../controllers/compras.controller";
import { validarToken } from "../middlewares/auth";

const router = Router();

// Todas las rutas de compras requieren autenticación.
router.use(validarToken);

// Consultas del usuario autenticado.
router.get("/mis-compras", comprasController.obtenerMisCompras);

// Gestión de compras.
router.get("/", comprasController.obtenerCompras);
router.post("/", comprasController.crearCompra);
router.get("/:id", comprasController.obtenerCompraPorId);

// Procesamiento del pago simulado.
router.post("/:id/pagar", comprasController.pagarCompra);

export default router;
