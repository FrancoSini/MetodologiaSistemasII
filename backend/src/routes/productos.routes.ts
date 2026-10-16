import { Router } from "express";
import * as productosController from "../controllers/productos.controller";
import { validarProducto } from "../middlewares/validarproducto";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Obtener todos los productos
router.get("/", asyncHandler(productosController.obtenerProductos));

// Obtener un producto por ID
router.get("/:id", asyncHandler(productosController.obtenerProductoPorId));

// Crear un producto: primero valida, después ejecuta el controller
router.post(
  "/",
  validarProducto,
  asyncHandler(productosController.crearProducto)
);

export default router;