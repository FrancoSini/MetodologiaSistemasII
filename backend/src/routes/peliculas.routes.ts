
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

import {
  validarToken,
  validarAdmin,
} from "../middlewares/auth";

const router = Router();

// RUTAS PÚBLICAS
// Cualquier visitante puede consultar la cartelera.
router.get("/", getPeliculas);
router.get("/:id", getPeliculaById);

// RUTAS PROTEGIDAS
// Solo los administradores pueden gestionar películas.

// Crear película.
router.post(
  "/",
  validarToken,
  validarAdmin,
  validarCrearPelicula,
  createPelicula
);

// Actualizar película.
router.put(
  "/:id",
  validarToken,
  validarAdmin,
  validarActualizarPelicula,
  updatePelicula
);

// Eliminar película.
router.delete(
  "/:id",
  validarToken,
  validarAdmin,
  deletePelicula
);

export default router;
