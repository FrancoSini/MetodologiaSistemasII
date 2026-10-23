import { Router } from "express";
import * as salaController from "../controllers/sala.controller";
import { validarCrearSala } from "../middlewares/validarSala";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(salaController.obtenerSalas));
router.get("/:id", asyncHandler(salaController.obtenerSalaPorId));
router.post("/", validarCrearSala, asyncHandler(salaController.crearSala));

export default router;