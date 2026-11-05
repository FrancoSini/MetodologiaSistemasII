
import sequelize from "../config/database";
import {
  Compra,
  Entrada,
  Funcion,
  FuncionButaca,
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

  // Validar los datos recibidos.
  if (
    !Number.isInteger(compraId) ||
    compraId <= 0 ||
    !Number.isInteger(funcionButacaId) ||
    funcionButacaId <= 0 ||
    typeof codigo !== "string" ||
    codigo.trim().length === 0
  ) {
    throw new AppError(
      "Los datos de la entrada son inválidos",
      400
    );
  }

  return sequelize.transaction(async (t) => {
    // Comprobar que la compra exista.
    const compra = await Compra.findByPk(compraId, {
      transaction: t,
    });

    if (!compra) {
      throw new AppError("Compra no encontrada", 404);
    }

    // Solo emitir entradas de compras confirmadas.
    if (compra.estado !== "confirmada") {
      throw new AppError(
        "La compra debe estar confirmada para emitir entradas",
        409
      );
    }

    // Identificar la butaca de la función.
    const butacaInicial = await FuncionButaca.findByPk(
      funcionButacaId,
      { transaction: t }
    );

    if (!butacaInicial) {
      throw new AppError(
        "Butaca de función no encontrada",
        404
      );
    }

    // Identificar la función correspondiente.
    const funcionInicial = await Funcion.findByPk(
      butacaInicial.funcionId,
      { transaction: t }
    );

    if (!funcionInicial) {
      throw new AppError(
        "Función no encontrada",
        404
      );
    }

    // Bloquear la sala.
    const sala = await Sala.findByPk(
      funcionInicial.salaId,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!sala) {
      throw new AppError(
        "Sala no encontrada",
        404
      );
    }

    // Bloquear la función.
    const funcion = await Funcion.findByPk(
      funcionInicial.id,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!funcion) {
      throw new AppError(
        "Función no encontrada",
        404
      );
    }

    // Impedir ventas de funciones canceladas.
    if (funcion.estado !== "programada") {
      throw new AppError(
        "No se pueden emitir entradas para una función cancelada",
        409
      );
    }

    // Bloquear la butaca para evitar ventas duplicadas.
    const funcionButaca = await FuncionButaca.findByPk(
      funcionButacaId,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!funcionButaca) {
      throw new AppError(
        "Butaca de función no encontrada",
        404
      );
    }

    if (funcionButaca.funcionId !== funcion.id) {
      throw new AppError(
        "La butaca no corresponde a la función",
        409
      );
    }

    // No permitir una segunda venta.
    if (funcionButaca.estado !== "disponible") {
      throw new AppError(
        "La butaca no está disponible",
        409
      );
    }

    // Crear la entrada.
    const entrada = await Entrada.create(
      {
        compraId,
        funcionButacaId,
        codigo: codigo.trim(),
      },
      { transaction: t }
    );

    // Cambiar el estado de la butaca a vendida.
    await funcionButaca.update(
      {
        estado: "vendida",
      },
      {
        transaction: t,
      }
    );

    return entrada;
  });
}