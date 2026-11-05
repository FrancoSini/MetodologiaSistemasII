
import sequelize from "../config/database";
import {
  Compra,
  Entrada,
  Funcion,
  FuncionButaca,
  ReservaButaca,
  Sala,
} from "../models";
import { AppError } from "../utils/AppError";

interface EmitirEntradaDTO {
  compraId: number;
  funcionButacaId: number;
  codigo: string;
}

export async function emitirEntrada(datos: EmitirEntradaDTO) {
  const { compraId, funcionButacaId, codigo } = datos;

  // 1. Validar los datos de entrada.
  if (
    !Number.isInteger(compraId) ||
    compraId <= 0 ||
    !Number.isInteger(funcionButacaId) ||
    funcionButacaId <= 0 ||
    typeof codigo !== "string" ||
    codigo.trim().length === 0
  ) {
    throw new AppError(
      "Los datos de la entrada son invalidos",
      400
    );
  }

  return sequelize.transaction(async (t) => {
    // 2. Verificar la compra.
    const compra = await Compra.findByPk(compraId, {
      transaction: t,
    });

    if (!compra) {
      throw new AppError("Compra no encontrada", 404);
    }

    if (compra.estado !== "confirmada") {
      throw new AppError(
        "La compra debe estar confirmada para emitir entradas",
        409
      );
    }

    // 3. Identificar la butaca y su funcion.
    const butacaInicial = await FuncionButaca.findByPk(
      funcionButacaId,
      { transaction: t }
    );

    if (!butacaInicial) {
      throw new AppError(
        "Butaca de funcion no encontrada",
        404
      );
    }

    const funcionInicial = await Funcion.findByPk(
      butacaInicial.funcionId,
      { transaction: t }
    );

    if (!funcionInicial) {
      throw new AppError("Funcion no encontrada", 404);
    }

    // 4. Bloquear sala, funcion y butaca
    // siguiendo el mismo orden que los otros servicios.
    const sala = await Sala.findByPk(
      funcionInicial.salaId,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!sala) {
      throw new AppError("Sala no encontrada", 404);
    }

    const funcion = await Funcion.findByPk(
      funcionInicial.id,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!funcion) {
      throw new AppError("Funcion no encontrada", 404);
    }

    if (funcion.estado !== "programada") {
      throw new AppError(
        "No se pueden emitir entradas para una funcion cancelada",
        409
      );
    }

    const butaca = await FuncionButaca.findByPk(
      funcionButacaId,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!butaca || butaca.funcionId !== funcion.id) {
      throw new AppError(
        "Butaca de funcion no encontrada",
        404
      );
    }

    // 5. Verificar si existe una reserva activa.
    const reserva = await ReservaButaca.findOne({
      where: {
        funcionButacaId,
        estado: "activa",
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // 6. Controlar el estado de la butaca.
    if (butaca.estado === "vendida") {
      throw new AppError(
        "La butaca ya esta vendida",
        409
      );
    }

    if (reserva) {
      // La reserva debe pertenecer a la misma compra.
      if (reserva.compraId !== compraId) {
        throw new AppError(
          "La butaca esta reservada por otra compra",
          409
        );
      }

      // No se permite consumir una reserva vencida.
      if (reserva.venceEn.getTime() <= Date.now()) {
        throw new AppError(
          "La reserva ha vencido",
          409
        );
      }

      // Una reserva activa exige una butaca reservada.
      if (butaca.estado !== "reservada") {
        throw new AppError(
          "El estado de la reserva y la butaca no coincide",
          409
        );
      }
    } else {
      // Si no existe reserva activa, solo se admite
      // la venta directa de una butaca disponible.
      if (butaca.estado !== "disponible") {
        throw new AppError(
          "La butaca no esta disponible",
          409
        );
      }
    }

    // 7. Crear la entrada.
    const entrada = await Entrada.create(
      {
        compraId,
        funcionButacaId,
        codigo: codigo.trim(),
      },
      { transaction: t }
    );

    // 8. Marcar la reserva como consumida, si existe.
    if (reserva) {
      await reserva.update(
        { estado: "consumida" },
        { transaction: t }
      );
    }

    // 9. Marcar la butaca como vendida.
    await butaca.update(
      { estado: "vendida" },
      { transaction: t }
    );

    return entrada;
  });
}
