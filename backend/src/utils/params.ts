import { AppError } from "./AppError";

// Convierte un parámetro de ruta (/:id, siempre llega como string) en un ID válido.
// Si no lo es, corta con 400 en vez de mandar "abc" a la base de datos.
export function obtenerId(valor: unknown): number {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("El ID debe ser un número entero positivo", 400);
  }

  return id;
}