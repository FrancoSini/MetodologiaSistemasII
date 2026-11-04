import { Request, Response, NextFunction } from "express";
import { Pelicula } from "../models";
import { obtenerId } from "../utils/params";
import { actualizarPelicula } from "../services/peliculaService";
// Obtener todas las películas (con opción de filtrar si son próximos estrenos o no)

export async function getPeliculas(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { proximoEstreno } = req.query;

    if (
      proximoEstreno !== undefined &&
      proximoEstreno !== "true" &&
      proximoEstreno !== "false"
    ) {
      return res.status(400).json({
        error: {
          mensaje: "proximoEstreno debe ser true o false",
        },
      });
    }

    const whereClause =
      proximoEstreno !== undefined
        ? { esProximoEstreno: proximoEstreno === "true" }
        : {};

    const peliculas = await Pelicula.findAll({
      where: whereClause,
    });

    return res.status(200).json(peliculas);
  } catch (error) {
    next(error);
  }
}


    // Obtener una película específica por su ID
    export async function getPeliculaById(req: Request, res: Response, next: NextFunction) {
    try {
        const pelicula = await Pelicula.findByPk(obtenerId(req.params.id));

        if (!pelicula) {
        return res.status(404).json({ error: { mensaje: "Película no encontrada" } });
        }

        return res.json(pelicula);
    } catch (error) {
        next(error);
    }
}

// Crear una nueva película (para administración)
export async function createPelicula(req: Request, res: Response, next: NextFunction) {
    try {
        const { titulo, genero, duracionMinutos, clasificacion, sinopsis, posterUrl, trailerUrl, esProximoEstreno } = req.body;

        const nuevaPelicula = await Pelicula.create({
        titulo,
        genero,
        duracionMinutos,
        clasificacion,
        sinopsis,
        posterUrl,
        trailerUrl,
        esProximoEstreno,
        });

        return res.status(201).json(nuevaPelicula);
    } catch (error) {
        next(error);
    }
}

export async function updatePelicula(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = obtenerId(req.params.id);

    const peliculaActualizada = await actualizarPelicula(
      id,
      req.body
    );

    return res.status(200).json(peliculaActualizada);
  } catch (error) {
    next(error);
  }
}
