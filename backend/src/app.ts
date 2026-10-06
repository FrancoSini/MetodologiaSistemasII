import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler, notFound } from "./middlewares/errorHandler";

// Acá solo se ARMA la app Express (middlewares + rutas).
// Levantar el servidor y conectar la base está en server.ts.
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api", routes);

// Siempre al final: primero 404 y después el manejador de errores
app.use(notFound);
app.use(errorHandler);

export default app;