import { Op, Transaction } from "sequelize";
import sequelize from "../config/database";
import {
  Butaca,
  Funcion,
  FuncionButaca,
  Pelicula,
  Sala,
} from "../models";
import { AppError } from "../utils/AppError";
import { haySuperposicionHorarios } from "../utils/superposicionHorarios";
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
      where: { salaId ,
        estado: "programada" ,
      },
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

      const haySuperposicion = haySuperposicionHorarios(
      inicioNuevo,
      finNuevo,
      inicioExistente,
      finExistente
      );

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


interface ActualizarHorarioDTO {
  fecha?: string;
  hora?: string;
}

// PUT /api/funciones/:id
export async function actualizarHorarioFuncion(
  id: number,
  datos: ActualizarHorarioDTO
) {
  return sequelize.transaction(async (t) => {
    const funcionActual = await Funcion.findByPk(id, {
      transaction: t,
    });

    if (!funcionActual) {
      throw new AppError("Función no encontrada", 404);
    }

    // Bloqueamos la sala para evitar conflictos de horarios.
    const sala = await Sala.findByPk(funcionActual.salaId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!sala) {
      throw new AppError("Sala no encontrada", 404);
    }

    const funcion = await Funcion.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!funcion) {
      throw new AppError("Función no encontrada", 404);
    }

    // No modificar una función cancelada.
    if (funcion.estado === "cancelada") {
      throw new AppError(
        "No se puede modificar una función cancelada",
        409
      );
    }

    // Verificar que no tenga butacas reservadas o vendidas.
    const butacas = await FuncionButaca.findAll({
      where: { funcionId: id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (
      butacas.some(
        (butaca) => butaca.estado !== "disponible"
      )
    ) {
      throw new AppError(
        "No se puede modificar una función con butacas reservadas o vendidas",
        409
      );
    }

    const nuevaFecha = datos.fecha ?? funcion.fecha;
    const nuevaHora = datos.hora ?? funcion.hora;

    const inicioNuevo = obtenerInstante(
      nuevaFecha,
      nuevaHora
    );

    const pelicula = await Pelicula.findByPk(
      funcion.peliculaId,
      { transaction: t }
    );

    if (!pelicula) {
      throw new AppError("Película no encontrada", 404);
    }

    const finNuevo =
      inicioNuevo + pelicula.duracionMinutos * 60_000;

    // Buscamos otras funciones programadas en la misma sala.
    const otrasFunciones = await Funcion.findAll({
      where: {
        salaId: funcion.salaId,
        estado: "programada",
        id: { [Op.ne]: id },
      },
      include: [
        {
          model: Pelicula,
          required: true,
        },
      ],
      transaction: t,
    });

    // Verificar superposición de horarios.
    for (const otra of otrasFunciones) {
      const otraPelicula = otra.get("Pelicula") as Pelicula;

      const inicioExistente = obtenerInstante(
        otra.fecha,
        otra.hora
      );

      
      const finExistente =
      inicioExistente +
      otraPelicula.duracionMinutos * 60_000;

      const haySuperposicion = haySuperposicionHorarios(
      inicioNuevo,
      finNuevo,
      inicioExistente,
      finExistente
      );

      if (haySuperposicion) {
      throw new AppError(
        "La sala ya tiene una función en ese horario",
        409
      );
      }

    }

    // Actualizar únicamente fecha y hora.
    await funcion.update(
      {
        fecha: nuevaFecha,
        hora: nuevaHora,
      },
      { transaction: t }
    );

    return funcion;
  });
}

// PATCH /api/funciones/:id/cancelar
export async function cancelarFuncion(id: number) {
  return sequelize.transaction(async (t) => {
    const funcionActual = await Funcion.findByPk(id, {
      transaction: t,
    });

    if (!funcionActual) {
      throw new AppError("Función no encontrada", 404);
    }

    // Bloqueamos primero la sala.
    const sala = await Sala.findByPk(
      funcionActual.salaId,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!sala) {
      throw new AppError("Sala no encontrada", 404);
    }

    // Bloqueamos la función.
    const funcion = await Funcion.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!funcion) {
      throw new AppError("Función no encontrada", 404);
    }

    if (funcion.estado === "cancelada") {
      throw new AppError(
        "La función ya está cancelada",
        409
      );
    }

    // Verificar que no tenga reservas ni ventas.
    const butacasOcupadas = await FuncionButaca.count({
      where: {
        funcionId: id,
        estado: {
          [Op.in]: ["reservada", "vendida"],
        },
      },
      transaction: t,
    });

    if (butacasOcupadas > 0) {
      throw new AppError(
        "No se puede cancelar una función con butacas reservadas o vendidas",
        409
      );
    }

    // Cancelación lógica: no eliminamos ningún registro.
    await funcion.update(
      { estado: "cancelada" },
      { transaction: t }
    );

    return funcion;
  });
}
