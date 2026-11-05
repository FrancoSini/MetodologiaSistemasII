
import { Router } from "express";

import {
  getFunciones,
  getFuncionById,
  createFuncion,
  getButacasDeFuncion,
} from "../controllers/funcion.controller";

const router = Router();

router.get("/", getFunciones);

router.get("/:id/butacas", getButacasDeFuncion);

router.get("/:id", getFuncionById);

router.post("/", createFuncion);

export default router;
