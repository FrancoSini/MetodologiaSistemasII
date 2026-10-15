import { Request, Response, NextFunction } from "express";
import { Funcion, Pelicula, Sala } from "../models";
import { generarButacasDeFuncion } from "../services/funcionService";
import sequelize from "../config/database";
import { obtenerId } from "../utils/params";

// Obtener todas las funciones (incluyendo los datos de su película y sala asociada)
export async function getFunciones(req: Request, res: Response, next: NextFunction) {
    try {
        const funciones = await Funcion.findAll({
        include: [Pelicula, Sala],
        });
        return res.json(funciones);
    } catch (error) {
        next(error);
    }
    }

    // Obtener una función específica por su ID
    export async function getFuncionById(req: Request, res: Response, next: NextFunction) {
    try {
        const funcion = await Funcion.findByPk(obtenerId(req.params.id), {
        include: [Pelicula, Sala],
        });

        if (!funcion) {
        return res.status(404).json({ error: { mensaje: "Función no encontrada" } });
        }

        return res.json(funcion);
    } catch (error) {
        next(error);
    }
}

// Crear una función y generar automáticamente sus butacas para la venta (transaccional)
export async function createFuncion(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    try {
        const { peliculaId, salaId, fecha, hora } = req.body;

        // 1. Creamos el registro de la función
        const nuevaFuncion = await Funcion.create(
        { peliculaId, salaId, fecha, hora },
        { transaction: t }
        );

        // 2. Generamos todas las butacas asociadas a esta función con estado "disponible"[cite: 330]
        await generarButacasDeFuncion(nuevaFuncion, t);

        await t.commit();
        return res.status(201).json(nuevaFuncion);
    } catch (error) {
        await t.rollback();
        next(error);
    }
}