
import { useState, type FormEvent } from "react";
import type { Sesion } from "./AuthPanel";

const API_URL = "http://localhost:3001/api";

interface Props {
  sesion: Sesion;
  onPeliculaCreada: () => void | Promise<void>;
}

interface NuevaPelicula {
  titulo: string;
  genero: string;
  duracionMinutos: number;
  clasificacion: string;
  sinopsis: string;
  posterUrl: string | null;
  trailerUrl: string | null;
  esProximoEstreno: boolean;
}

export default function AdminPanel({
  sesion,
  onPeliculaCreada,
}: Props) {
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [duracion, setDuracion] = useState("");
  const [clasificacion, setClasificacion] = useState("");
  const [sinopsis, setSinopsis] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [esProximoEstreno, setEsProximoEstreno] =
    useState(false);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  async function guardarPelicula(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (guardando || sesion.rol !== "admin") {
      return;
    }

    setError("");
    setExito("");

    const duracionMinutos = Number(duracion);

    if (
      !Number.isInteger(duracionMinutos) ||
      duracionMinutos <= 0
    ) {
      setError("Ingresá una duración válida en minutos.");
      return;
    }

    const datos: NuevaPelicula = {
      titulo: titulo.trim(),
      genero: genero.trim(),
      duracionMinutos,
      clasificacion: clasificacion.trim(),
      sinopsis: sinopsis.trim(),
      posterUrl: posterUrl.trim() || null,
      trailerUrl: trailerUrl.trim() || null,
      esProximoEstreno,
    };

    setGuardando(true);

    try {
      const respuesta = await fetch(`${API_URL}/peliculas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify(datos),
      });

      if (!respuesta.ok) {
        let mensaje = "No se pudo crear la película";

        try {
          const respuestaError = await respuesta.json();
          mensaje =
            respuestaError?.error?.mensaje ??
            respuestaError?.msg ??
            respuestaError?.mensaje ??
            mensaje;
        } catch {
          // Conservar el mensaje predeterminado.
        }

        throw new Error(mensaje);
      }

      setExito(`Película "${datos.titulo}" creada correctamente.`);

      // Limpiar el formulario.
      setTitulo("");
      setGenero("");
      setDuracion("");
      setClasificacion("");
      setSinopsis("");
      setPosterUrl("");
      setTrailerUrl("");
      setEsProximoEstreno(false);

      // Actualizar la cartelera sin recargar la página.
      try {
        await onPeliculaCreada();
      } catch {
        setExito(
          `Película "${datos.titulo}" creada correctamente. ` +
          "Actualizá la página para verla en cartelera."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la película."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (sesion.rol !== "admin") {
    return null;
  }

  return (
    <section className="admin-panel">
      <div className="admin-encabezado">
        <h2>Panel de administración</h2>
        <p>
          Gestioná las películas disponibles en el cine.
        </p>
      </div>

      <div className="admin-formulario">
        <h3>Agregar nueva película</h3>

        <form onSubmit={guardarPelicula}>
          <div className="admin-campos">
            <label>
              Título
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                maxLength={150}
                placeholder="Ej: La última función"
              />
            </label>

            <label>
              Género
              <input
                type="text"
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                required
                placeholder="Ej: Drama"
              />
            </label>

            <label>
              Duración (minutos)
              <input
                type="number"
                min="1"
                step="1"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                required
                placeholder="Ej: 120"
              />
            </label>

            <label>
              Clasificación
              <input
                type="text"
                value={clasificacion}
                onChange={(e) =>
                  setClasificacion(e.target.value)
                }
                required
                placeholder="Ej: ATP, +13, +16"
              />
            </label>
          </div>

          <label>
            Sinopsis
            <textarea
              value={sinopsis}
              onChange={(e) => setSinopsis(e.target.value)}
              required
              rows={4}
              placeholder="Escribí una breve descripción..."
            />
          </label>

          <div className="admin-campos">
            <label>
              URL del póster (opcional)
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label>
              URL del tráiler (opcional)
              <input
                type="url"
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={esProximoEstreno}
              onChange={(e) =>
                setEsProximoEstreno(e.target.checked)
              }
            />
            ¿Es un próximo estreno?
          </label>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          {exito && (
            <p className="admin-exito" role="status">
              {exito}
            </p>
          )}

          <button
            type="submit"
            className="admin-boton"
            disabled={guardando}
          >
            {guardando
              ? "Guardando película..."
              : "Agregar película"}
          </button>
        </form>
      </div>
    </section>
  );
}
