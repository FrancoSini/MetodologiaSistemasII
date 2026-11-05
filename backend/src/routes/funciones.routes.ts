
import { Router } from "express";

import {
  getFunciones,
  getFuncionById,
  createFuncion,
  getButacasDeFuncion,
  updateFuncion,
  cancelFuncion,
} from "../controllers/funcion.controller";

const router = Router();

router.get("/", getFunciones);

router.get("/:id/butacas", getButacasDeFuncion);

router.get("/:id", getFuncionById);

router.post("/", createFuncion);

router.put("/:id", updateFuncion);
router.patch("/:id/cancelar", cancelFuncion);

export default router;
