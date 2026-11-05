
import sequelize from "../config/database";
import { Compra, Entrada, FuncionButaca } from "../models";
import { AppError } from "../utils/AppError";

interface EmitirEntradaDTO {
  compraId: number;
  funcionButacaId: number;
  codigo: string;
}

export async function emitirEntrada(datos: EmitirEntradaDTO) {
  const { compraId, funcionButacaId, codigo } = datos;

  // Validar datos de entrada.
  if (
    !Number.isInteger(compraId) ||
    compraId <= 0 ||
    !Number.isInteger(funcionButacaId) ||
    funcionButacaId <= 0 ||
    typeof codigo !== "string" ||
    codigo.trim().length === 0
  ) {
    throw new AppError("Los datos de la entrada son inválidos", 400);
  }

  return sequelize.transaction(async (t) => {
    // Verificar que la compra exista y esté confirmada.
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

    // Bloquear la butaca durante la operación.
    const funcionButaca = await FuncionButaca.findByPk(
      funcionButacaId,
      {
        transaction: t,
        lock: t.LOCK.UPDATE,
      }
    );

    if (!funcionButaca) {
      throw new AppError("Butaca de función no encontrada", 404);
    }

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

    // Actualizar la disponibilidad.
    await funcionButaca.update(
      { estado: "vendida" },
      { transaction: t }
    );

    return entrada;
  });
}
