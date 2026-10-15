import { Request, Response, NextFunction } from "express";
import { Sala, Butaca } from "../models";
import { crearButacasDeSala } from "../services/salaService";
import sequelize from "../config/database";
import { obtenerId } from "../utils/params";

// Obtener todas las salas del cine
export async function getSalas(req: Request, res: Response, next: NextFunction) {
    try {
        const salas = await Sala.findAll();
        return res.json(salas);
    } catch (error) {
        next(error);
    }
}

// Obtener una sala específica junto con sus butacas físicas asociadas
export async function getSalaById(req: Request, res: Response, next: NextFunction) {
    try {
        const sala = await Sala.findByPk(obtenerId(req.params.id), {
        include: [{ model: Butaca }],
        });

        if (!sala) {
        return res.status(404).json({ error: { mensaje: "Sala no encontrada" } });
        }

        return res.json(sala);
    } catch (error) {
        next(error);
    }
}

// Crear una nueva sala y generar sus butacas de forma transaccional
export async function createSala(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    try {
        const { nombre, cantidadButacas, filas, butacasPorFila } = req.body;

        // 1. Creamos la sala en la base de datos
        const nuevaSala = await Sala.create(
        { nombre, cantidadButacas },
        { transaction: t }
        );

        // 2. Si nos pasan las dimensiones de filas y columnas, generamos las butacas automáticamente[cite: 329]
        if (filas && butacasPorFila) {
        await crearButacasDeSala(nuevaSala.id, filas, butacasPorFila, t);
        }

        await t.commit();
        return res.status(201).json(nuevaSala);
    } catch (error) {
        await t.rollback();
        next(error);
    }
}