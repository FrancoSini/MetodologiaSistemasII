import { Router } from "express";
import * as productosController from "../controllers/productos.controller";
import {
  validarProducto,
  validarActualizarProducto,
} from "../middlewares/validarproducto";
import { validarToken, validarAdmin } from "../middlewares/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(productosController.obtenerProductos));
router.get("/:id", asyncHandler(productosController.obtenerProductoPorId));

router.post(
  "/",
  validarToken,
  validarAdmin,
  validarProducto,
  asyncHandler(productosController.crearProducto)
);

router.put(
  "/:id",
  validarToken,
  validarAdmin,
  validarActualizarProducto,
  asyncHandler(productosController.actualizarProducto)
);

router.delete(
  "/:id",
  validarToken,
  validarAdmin,
  asyncHandler(productosController.eliminarProducto)
);

export default router;