import { Router } from "express";
import { getFunciones, getFuncionById, createFuncion } from "../controllers/funcion.controller";

const router = Router();

router.get("/", getFunciones);
router.get("/:id", getFuncionById);
router.post("/", createFuncion);

export default router;