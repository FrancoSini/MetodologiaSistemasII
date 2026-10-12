
import { Router } from "express";
import * as productosController from "../controllers/productos.controller";

const router = Router();

// Obtener todos los productos
router.get("/", productosController.obtenerProductos);

// Obtener un producto por ID
router.get("/:id", productosController.obtenerProductoPorId);

// Crear un producto
router.post("/", productosController.crearProducto);

export default router;
