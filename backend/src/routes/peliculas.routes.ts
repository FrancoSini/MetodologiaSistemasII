
import { Router } from "express";

import {
  getPeliculas,
  getPeliculaById,
  createPelicula,
  updatePelicula,
  deletePelicula,
} from "../controllers/pelicula.controller";

import {
  validarCrearPelicula,
  validarActualizarPelicula,
} from "../middlewares/validarPelicula";

const router = Router();

// Listar películas.
router.get("/", getPeliculas);

// Consultar película por ID.
router.get("/:id", getPeliculaById);

// Crear película.
router.post("/", validarCrearPelicula, createPelicula);

// Actualizar película.
router.put("/:id", validarActualizarPelicula, updatePelicula);
router.delete("/:id", deletePelicula);

export default router;
