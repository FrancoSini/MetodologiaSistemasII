import { Transaction } from "sequelize";
import { Butaca, Funcion, FuncionButaca } from "../models";
import { AppError } from "../utils/AppError";
import sequelize from "../config/database";
import { Pelicula, Sala } from "../models";

// Al crear una función hay que generar una fila FuncionButaca por cada butaca
// de la sala, todas "disponible". Ahí vive el estado de cada asiento PARA ESA función.
export async function generarButacasDeFuncion(funcion: Funcion, transaction?: Transaction) {
  const butacas = await Butaca.findAll({ where: { salaId: funcion.salaId }, transaction });

  return FuncionButaca.bulkCreate(
    butacas.map((b) => ({ funcionId: funcion.id, butacaId: b.id, estado: "disponible" as const })),
    { transaction }
  );
}

export async function obtenerButacasDeFuncion(funcionId: number) {
  // Verificamos que la función exista.
  const funcion = await Funcion.findByPk(funcionId);

  if (!funcion) {
    throw new AppError("Función no encontrada", 404);
  }

  // Consultamos las butacas y su ubicación física.
  const registros = await FuncionButaca.findAll({
    where: { funcionId },
    include: [
      {
        model: Butaca,
        attributes: ["fila", "numero"],
      },
    ],
  });

  // Preparamos la respuesta para el frontend.
  const resultado = registros.map((registro) => {
    const butaca = registro.get("Butaca") as Butaca | undefined;

    return {
      id: registro.id,
      fila: butaca?.fila,
      numero: butaca?.numero,
      estado: registro.estado,
    };
  });

  // Ordenamos primero por fila y después por número.
  resultado.sort(
    (a, b) =>
      (a.fila ?? "").localeCompare(b.fila ?? "") ||
      (a.numero ?? 0) - (b.numero ?? 0)
  );

  return resultado;
}

interface CrearFuncionDTO {
  peliculaId: number;
  salaId: number;
  fecha: string;
  hora: string;
}

// Convierte fecha y hora del cine a un número comparable.
// Usamos UTC como escala de cálculo, no como zona horaria
// real de la función: no estamos convirtiendo husos horarios.
function obtenerInstante(fecha: string, hora: string): number {
  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  const horaValida = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(hora);

  if (!fechaValida || !horaValida) {
    throw new AppError("Fecha u hora inválida", 400);
  }

  const [anio, mes, dia] = fecha.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);

  const instante = Date.UTC(anio, mes - 1, dia, horas, minutos);
  const fechaComprobada = new Date(instante).toISOString().slice(0, 10);

  if (fechaComprobada !== fecha) {
    throw new AppError("Fecha inválida", 400);
  }

  return instante;
}

export async function crearFuncionConValidacion(
  datos: CrearFuncionDTO
) {
  const { peliculaId, salaId, fecha, hora } = datos;

  if (
    !Number.isInteger(peliculaId) || peliculaId <= 0 ||
    !Number.isInteger(salaId) || salaId <= 0
  ) {
    throw new AppError("Película o sala inválida", 400);
  }

  const inicioNuevo = obtenerInstante(fecha, hora);

  return sequelize.transaction(async (t) => {
    // Bloqueamos la sala mientras verificamos y creamos.
    const sala = await Sala.findByPk(salaId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!sala) {
      throw new AppError("Sala no encontrada", 404);
    }

    const pelicula = await Pelicula.findByPk(peliculaId, {
      transaction: t,
    });

    if (!pelicula) {
      throw new AppError("Película no encontrada", 404);
    }

    const finNuevo =
      inicioNuevo + pelicula.duracionMinutos * 60_000;

    // Incluimos todas las fechas para detectar incluso
    // funciones que cruzan la medianoche.
    const funciones = await Funcion.findAll({
      where: { salaId },
      include: [{ model: Pelicula, required: true }],
      transaction: t,
    });

    for (const funcion of funciones) {
      const peliculaExistente = funcion.get("Pelicula") as Pelicula;

      const inicioExistente = obtenerInstante(
        funcion.fecha,
        funcion.hora
      );

      const finExistente =
        inicioExistente +
        peliculaExistente.duracionMinutos * 60_000;

      const haySuperposicion =
        inicioNuevo < finExistente &&
        finNuevo > inicioExistente;

      if (haySuperposicion) {
        throw new AppError(
          "La sala ya tiene una función en ese horario",
          409
        );
      }
    }

    // Solo creamos la función si el horario está libre.
    const nuevaFuncion = await Funcion.create(
      { peliculaId, salaId, fecha, hora },
      { transaction: t }
    );

    // Generamos sus butacas dentro de la misma transacción.
    await generarButacasDeFuncion(nuevaFuncion, t);

    return nuevaFuncion;
  });
}


//Qué hace: cuando se crea una función, busca todas las butacas físicas de su sala y crea una fila de FuncionButaca por cada una, 
// todas en estado "disponible".

//Este es el punto clave de su modelo de datos: una butaca física (A1 de la Sala 1) existe una sola vez, 
// pero su estado se guarda por función. Así la A1 puede estar libre a las 18:00 y vendida a las 21:00. 
// Y como FuncionButaca tiene un índice único sobre (funcion_id, butaca_id), la base de datos misma impide duplicar un lugar.

//as const le dice a TypeScript que "disponible" es ese valor exacto y no un string cualquiera, que es lo que espera el modelo