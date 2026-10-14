import { Request, Response, NextFunction } from "express";
import { Pelicula } from "../models";

// Obtener todas las películas (con opción de filtrar si son próximos estrenos o no)
export async function getPeliculas(req: Request, res: Response, next: NextFunction) {
    try {
        const { proximoEstreno } = req.query;
        
        const whereClause = proximoEstreno !== undefined 
        ? { esProximoEstreno: proximoEstreno === "true" } 
        : {};

        const peliculas = await Pelicula.findAll({ where: whereClause });
        return res.json(peliculas);
    } catch (error) {
        next(error);
    }
    }

    // Obtener una película específica por su ID
    export async function getPeliculaById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const pelicula = await Pelicula.findByPk(id as string);

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