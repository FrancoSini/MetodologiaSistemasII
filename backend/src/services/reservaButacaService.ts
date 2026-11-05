
import { Transaction } from "sequelize";
import { Op } from "sequelize";
import sequelize from "../config/database";
import {
  Compra,
  Funcion,
  FuncionButaca,
  ReservaButaca,
  Sala,
} from "../models";
import { AppError } from "../utils/AppError";

const DURACION_RESERVA_MINUTOS = 15;

// Validar IDs recibidos.
function validarIds(...ids: number[]) {
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new AppError("Los IDs deben ser enteros positivos", 400);
  }
}

// Bloqueamos sala, funcion y butaca en el mismo orden
// que usamos en los otros servicios.
async function obtenerButacaBloqueada(
  funcionId: number,
  funcionButacaId: number,
  t: Transaction
) {
  const butacaInicial = await FuncionButaca.findByPk(
    funcionButacaId,
    { transaction: t }
  );

  if (!butacaInicial || butacaInicial.funcionId !== funcionId) {
    throw new AppError("Butaca de función no encontrada", 404);
  }

  const funcionInicial = await Funcion.findByPk(funcionId, {
    transaction: t,
  });

  if (!funcionInicial) {
    throw new AppError("Función no encontrada", 404);
  }

  const sala = await Sala.findByPk(funcionInicial.salaId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  if (!sala) {
    throw new AppError("Sala no encontrada", 404);
  }

  const funcion = await Funcion.findByPk(funcionId, {
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  if (!funcion) {
    throw new AppError("Función no encontrada", 404);
  }

  const butaca = await FuncionButaca.findByPk(
    funcionButacaId,
    {
      transaction: t,
      lock: t.LOCK.UPDATE,
    }
  );

  if (!butaca || butaca.funcionId !== funcion.id) {
    throw new AppError("Butaca de función no encontrada", 404);
  }

  return { funcion, butaca };
}

// POST: reservar una butaca.
export async function reservarButaca(
  funcionId: number,
  funcionButacaId: number,
  compraId: number
) {
  validarIds(funcionId, funcionButacaId, compraId);

  return sequelize.transaction(async (t) => {
    const { funcion, butaca } = await obtenerButacaBloqueada(
      funcionId,
      funcionButacaId,
      t
    );

    if (funcion.estado !== "programada") {
      throw new AppError(
        "No se puede reservar una función cancelada",
        409
      );
    }

    const compra = await Compra.findByPk(compraId, {
      transaction: t,
    });

    if (!compra) {
      throw new AppError("Compra no encontrada", 404);
    }

    if (compra.estado !== "pendiente") {
      throw new AppError(
        "La compra debe estar pendiente para reservar",
        409
      );
    }

    const reservaActiva = await ReservaButaca.findOne({
      where: {
        funcionButacaId,
        estado: "activa",
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const ahora = new Date();

    // Si la reserva anterior venció, liberamos la butaca.
    if (reservaActiva && reservaActiva.venceEn <= ahora) {
      await reservaActiva.update(
        { estado: "vencida" },
        { transaction: t }
      );

      if (butaca.estado === "reservada") {
        await butaca.update(
          { estado: "disponible" },
          { transaction: t }
        );
      }
    } else if (reservaActiva) {
      throw new AppError(
        "La butaca ya tiene una reserva activa",
        409
      );
    }

    if (butaca.estado !== "disponible") {
      throw new AppError(
        "La butaca no está disponible",
        409
      );
    }

    const venceEn = new Date(
      ahora.getTime() + DURACION_RESERVA_MINUTOS * 60_000
    );

    const reserva = await ReservaButaca.create(
      {
        compraId,
        funcionButacaId,
        venceEn,
        estado: "activa",
      },
      { transaction: t }
    );

    await butaca.update(
      { estado: "reservada" },
      { transaction: t }
    );

    return reserva;
  });
}

// PATCH: liberar una reserva.
export async function liberarReserva(
  funcionId: number,
  funcionButacaId: number,
  compraId: number
) {
  validarIds(funcionId, funcionButacaId, compraId);

  return sequelize.transaction(async (t) => {
    const { butaca } = await obtenerButacaBloqueada(
      funcionId,
      funcionButacaId,
      t
    );

    const reserva = await ReservaButaca.findOne({
      where: {
        funcionButacaId,
        estado: "activa",
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!reserva) {
      throw new AppError(
        "No existe una reserva activa para esta butaca",
        404
      );
    }

    if (reserva.compraId !== compraId) {
      throw new AppError(
        "La reserva no pertenece a la compra indicada",
        403
      );
    }

    if (butaca.estado !== "reservada") {
      throw new AppError(
        "La butaca no está en estado reservada",
        409
      );
    }

    // Si venció, registramos el vencimiento.
    // Si no, registramos una liberación voluntaria.
    const nuevoEstado =
      reserva.venceEn <= new Date()
        ? "vencida"
        : "liberada";

    await reserva.update(
      { estado: nuevoEstado },
      { transaction: t }
    );

    await butaca.update(
      { estado: "disponible" },
      { transaction: t }
    );

    return reserva;
  });
}

export async function liberarReservasVencidas(
  funcionId: number
) {
  validarIds(funcionId);

  return sequelize.transaction(async (t) => {
    const funcionInicial = await Funcion.findByPk(funcionId, {
      transaction: t,
    });

    if (!funcionInicial) {
      throw new AppError("Función no encontrada", 404);
    }

    // Mantenemos el mismo orden de bloqueos.
    const sala = await Sala.findByPk(funcionInicial.salaId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!sala) {
      throw new AppError("Sala no encontrada", 404);
    }

    const funcion = await Funcion.findByPk(funcionId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!funcion) {
      throw new AppError("Función no encontrada", 404);
    }

    const butacas = await FuncionButaca.findAll({
      where: { funcionId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const ahora = new Date();

    for (const butaca of butacas) {
      const reservaVencida = await ReservaButaca.findOne({
        where: {
          funcionButacaId: butaca.id,
          estado: "activa",
          venceEn: { [Op.lte]: ahora },
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!reservaVencida) {
        continue;
      }

      await reservaVencida.update(
        { estado: "vencida" },
        { transaction: t }
      );

      if (butaca.estado === "reservada") {
        await butaca.update(
          { estado: "disponible" },
          { transaction: t }
        );
      }
    }
  });
}
