import { Router } from "express";
import * as comprasController from "../controllers/compras.controller";
import { validarToken } from "../middlewares/auth";

const router = Router();

router.use(validarToken);

router.get("/", comprasController.obtenerCompras);
router.get("/:id", comprasController.obtenerCompraPorId);
router.post("/", comprasController.crearCompra);

router.get("/mis-compras", comprasController.obtenerMisCompras);


export default router;


