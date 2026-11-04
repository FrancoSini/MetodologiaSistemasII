
import { Pelicula } from "../models";
import { AppError } from "../utils/AppError";

// Datos que se pueden modificar de una película.
export interface DatosActualizarPelicula {
  titulo?: string;
  genero?: string;
  duracionMinutos?: number;
  clasificacion?: string;
  sinopsis?: string;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  esProximoEstreno?: boolean;
}

// Busca una película y actualiza sus datos.
export async function actualizarPelicula(
  id: number,
  datos: DatosActualizarPelicula
) {
  const pelicula = await Pelicula.findByPk(id);

  if (!pelicula) {
    throw new AppError("Película no encontrada", 404);
  }

  await pelicula.update(datos);

  return pelicula;
}
