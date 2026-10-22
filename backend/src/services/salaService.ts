import sequelize from "../config/database";
import { Butaca, Sala } from "../models";
import { AppError } from "../utils/AppError";

// Datos que necesita el servicio para crear una sala (ya validados en su forma por el middleware).
export interface CrearSalaDTO {
  nombre: string;
  filas: number;
  butacasPorFila: number;
}

// Una letra por fila (A-Z).
const MAX_FILAS = 26;

const letraDeFila = (indice: number) => String.fromCharCode(65 + indice);

// Regla de negocio, sin base de datos: devuelve la distribución física (A1..A8, B1..B8, ...)
// o lanza AppError si las dimensiones no son válidas. Se puede probar sola.
export function generarDistribucion(filas: number, butacasPorFila: number) {
  if (filas < 1 || filas > MAX_FILAS || butacasPorFila < 1) {
    throw new AppError(`La sala debe tener entre 1 y ${MAX_FILAS} filas y al menos 1 butaca por fila`, 400);
  }

  const distribucion: { fila: string; numero: number }[] = [];
  for (let f = 0; f < filas; f++) {
    for (let n = 1; n <= butacasPorFila; n++) {
      distribucion.push({ fila: letraDeFila(f), numero: n });
    }
  }
  return distribucion;
}

export async function obtenerSalas() {
  return Sala.findAll();
}

// La sala junto con sus butacas físicas.
export async function obtenerSalaPorId(id: number) {
  const sala = await Sala.findByPk(id, { include: [{ model: Butaca }] });

  if (!sala) {
    throw new AppError("Sala no encontrada", 404);
  }

  return sala;
}

// Crea la sala y todas sus butacas en una sola transacción: si algo falla, no queda nada a medias.
// La cantidad de butacas se calcula (filas x butacasPorFila): no se pide aparte, para que no se contradiga.
export async function crearSala({ nombre, filas, butacasPorFila }: CrearSalaDTO) {
  const distribucion = generarDistribucion(filas, butacasPorFila);

  return sequelize.transaction(async (t) => {
    const sala = await Sala.create(
      { nombre: nombre.trim(), cantidadButacas: distribucion.length },
      { transaction: t }
    );

    await Butaca.bulkCreate(
      distribucion.map((b) => ({ salaId: sala.id, ...b })),
      { transaction: t }
    );

    return sala;
  });
}