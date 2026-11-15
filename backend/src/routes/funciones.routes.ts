
import { Router } from "express";

import {
  getFunciones,
  getFuncionById,
  createFuncion,
  getButacasDeFuncion,
  updateFuncion,
  cancelFuncion,
} from "../controllers/funcion.controller";

import {
  reservar,
  liberar,
} from "../controllers/reservaButaca.controller";

import {
  validarToken,
  validarAdmin,
} from "../middlewares/auth";

const router = Router();

// RUTAS PÚBLICAS
router.get("/", getFunciones);
router.get("/:id/butacas", getButacasDeFuncion);
router.get("/:id", getFuncionById);

// RUTAS ADMINISTRATIVAS

// Crear una función.
router.post(
  "/",
  validarToken,
  validarAdmin,
  createFuncion
);

// Modificar fecha u horario.
router.put(
  "/:id",
  validarToken,
  validarAdmin,
  updateFuncion
);

// Cancelar una función.
router.delete(
  "/:id",
  validarToken,
  validarAdmin,
  cancelFuncion
);

// Endpoint alternativo de cancelación.
router.patch(
  "/:id/cancelar",
  validarToken,
  validarAdmin,
  cancelFuncion
);

// RESERVAS
// Conservamos temporalmente las rutas existentes,
// pero debemos revisar sus permisos por separado.
router.post("/:id/butacas/:butacaId/reservar", reservar);
router.patch("/:id/butacas/:butacaId/liberar", liberar);

export default router;
