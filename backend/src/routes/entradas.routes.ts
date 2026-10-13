
import { Router } from "express";
import * as entradasController from "../controllers/entradas.controller";

import { asyncHandler } from "../utils/asyncHandler";


const router = Router();

// Obtener todas las entradas
router.get("/", entradasController.obtenerEntradas);

// Obtener una entrada por ID
router.get("/:id", entradasController.obtenerEntradaPorId);

// Registrar una entrada de mercadería
router.post("/", entradasController.crearEntrada);

export default router;
