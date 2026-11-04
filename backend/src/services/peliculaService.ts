import { Pelicula, Funcion } from "../models";
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

export async function eliminarPelicula(id: number): Promise<void> {
  const pelicula = await Pelicula.findByPk(id);

  if (!pelicula) {
    throw new AppError("Película no encontrada", 404);
  }

  // Comprobar si la película tiene funciones asociadas.
  const cantidadFunciones = await Funcion.count({
    where: { peliculaId: id },
  });

  if (cantidadFunciones > 0) {
    throw new AppError(
      "No se puede eliminar la película porque tiene funciones asociadas",
      409
    );
  }

  // Eliminar únicamente si no existen funciones relacionadas.
  await pelicula.destroy();
}
