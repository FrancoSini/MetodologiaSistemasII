import { Router } from "express";
import { getSalas, getSalaById, createSala } from "../controllers/sala.controller";

const router = Router();

router.get("/", getSalas);
router.get("/:id", getSalaById);
router.post("/", createSala);

export default router;