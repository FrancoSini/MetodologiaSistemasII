
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
  reservar, liberar,} from "../controllers/reservaButaca.controller";
const router = Router();

router.get("/", getFunciones);

router.get("/:id/butacas", getButacasDeFuncion);

router.get("/:id", getFuncionById);

router.post("/", createFuncion);

router.put("/:id", updateFuncion);
// DELETE realiza una cancelación lógica.
// No elimina físicamente la función de la base de datos.
router.delete("/:id", cancelFuncion);
// Conservamos el endpoint anterior por compatibilidad
router.patch("/:id/cancelar", cancelFuncion);

router.post("/:id/butacas/:butacaId/reservar", reservar);
router.patch("/:id/butacas/:butacaId/liberar", liberar);

export default router;
