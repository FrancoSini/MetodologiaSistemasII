import { Transaction } from "sequelize";
import { Butaca, Funcion, FuncionButaca } from "../models";
import { AppError } from "../utils/AppError";

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

//Qué hace: cuando se crea una función, busca todas las butacas físicas de su sala y crea una fila de FuncionButaca por cada una, 
// todas en estado "disponible".

//Este es el punto clave de su modelo de datos: una butaca física (A1 de la Sala 1) existe una sola vez, 
// pero su estado se guarda por función. Así la A1 puede estar libre a las 18:00 y vendida a las 21:00. 
// Y como FuncionButaca tiene un índice único sobre (funcion_id, butaca_id), la base de datos misma impide duplicar un lugar.

//as const le dice a TypeScript que "disponible" es ese valor exacto y no un string cualquiera, que es lo que espera el modelo