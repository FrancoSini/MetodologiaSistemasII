
import { Router } from "express";
import * as entradasController from "../controllers/entradas.controller";

import { asyncHandler } from "../utils/asyncHandler";
import { validarToken } from "../middlewares/auth";

const router = Router();

// Obtener todas las entradas
router.get("/", entradasController.obtenerEntradas);


// Registrar una entrada de mercadería
router.post("/", entradasController.crearEntrada);
router.get(
  "/mis-entradas",
  validarToken,
  asyncHandler(entradasController.obtenerMisEntradas)
);
// Obtener una entrada por ID
router.get("/:id", entradasController.obtenerEntradaPorId);

export default router;
