
import { Router } from "express";
import * as salaController from "../controllers/sala.controller";
import { validarCrearSala } from "../middlewares/validarSala";
import { asyncHandler } from "../utils/asyncHandler";
import { validarToken, validarAdmin } from "../middlewares/auth";

const router = Router();

// Consultas públicas
router.get("/", asyncHandler(salaController.obtenerSalas));
router.get("/:id", asyncHandler(salaController.obtenerSalaPorId));

// Operaciones exclusivas del administrador
router.post(
  "/",
  validarToken,
  validarAdmin,
  validarCrearSala,
  asyncHandler(salaController.crearSala)
);

router.put(
  "/:id",
  validarToken,
  validarAdmin,
  asyncHandler(salaController.actualizarSala)
);

router.delete(
  "/:id",
  validarToken,
  validarAdmin,
  asyncHandler(salaController.eliminarSala)
);

export default router;
