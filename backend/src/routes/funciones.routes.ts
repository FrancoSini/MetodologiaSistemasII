
import { Router } from "express";

import {
  getFunciones,
  getFuncionById,
  createFuncion,
  getButacasDeFuncion,
  updateFuncion,
} from "../controllers/funcion.controller";

const router = Router();

router.get("/", getFunciones);

router.get("/:id/butacas", getButacasDeFuncion);

router.get("/:id", getFuncionById);

router.post("/", createFuncion);

router.put("/:id", updateFuncion);

export default router;
