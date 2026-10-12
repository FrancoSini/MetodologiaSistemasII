import { Router } from "express";
import sequelize from "../config/database";
import { asyncHandler } from "../utils/asyncHandler";



import productosRoutes from "./productos.routes";
import entradasRoutes from "./entradas.routes";
import comprasRoutes from "./compras.routes";


const router = Router();

// GET /api/salud -> sirve para comprobar que el backend y la base responden
router.get(
  "/salud",
  asyncHandler(async (_req, res) => {
    await sequelize.authenticate();
    res.json({ estado: "ok", baseDeDatos: "conectada" });
  })
);

// Los routers de cada módulo se van montando acá a medida que se implementan:
// router.use("/autenticacion", autenticacionRouter);
// router.use("/peliculas", peliculasRouter);
// router.use("/salas", salasRouter);
// router.use("/funciones", funcionesRouter);

router.use("/productos", productosRoutes);
router.use("/compras", comprasRoutes);
router.use("/entradas", entradasRoutes);

export default router;

