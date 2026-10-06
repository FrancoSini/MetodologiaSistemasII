//Qué hace: dada una sala, crea todos sus asientos. crearButacasDeSala(1, 5, 8) genera 40 butacas: A1 a A8, B1 a B8, y así hasta la fila E.

//String.fromCharCode(65 + indice): el código 65 es la letra "A", así que índice 0 da "A", 1 da "B", etc. Por eso el máximo son 26 filas.
//bulkCreate inserta todas las butacas en una sola consulta, en vez de 40 consultas separadas.
//transaction? es opcional. Si lo pasamos, esta operación forma parte de una transacción más grande, y si algo falla después, 
// todo se deshace junto. 
import { Transaction } from "sequelize";
import { Butaca } from "../models";

// Genera las filas A, B, C... (hasta 26 filas)
const letraDeFila = (indice: number) => String.fromCharCode(65 + indice);

// Creamos la distribución física de una sala: `filas` x `butacasPorFila`.
// Se reutiliza en el seeder y en el futuro POST /api/salas.
export async function crearButacasDeSala(
  salaId: number,
  filas: number,
  butacasPorFila: number,
  transaction?: Transaction
) {
  if (filas < 1 || filas > 26 || butacasPorFila < 1) {
    throw new Error("Cantidad de filas o butacas inválida");
  }

  const butacas = [];
  for (let f = 0; f < filas; f++) {
    for (let n = 1; n <= butacasPorFila; n++) {
      butacas.push({ salaId, fila: letraDeFila(f), numero: n });
    }
  }

  return Butaca.bulkCreate(butacas, { transaction });
}