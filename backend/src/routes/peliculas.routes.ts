
import { Router } from "express";

import {
  getPeliculas,
  getPeliculaById,
  createPelicula,
} from "../controllers/pelicula.controller";

import { validarCrearPelicula } from "../middlewares/validarPelicula";

const router = Router();

// Consultar todas las películas.
router.get("/", getPeliculas);

// Consultar una película por ID.
router.get("/:id", getPeliculaById);

// Crear una película, validando antes los datos.
router.post("/", validarCrearPelicula, createPelicula);

export default router;
