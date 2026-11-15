
import { useEffect, useState, type FormEvent } from "react";
import type { Sesion } from "./AuthPanel";

const API_URL = "http://localhost:3001/api";

interface Pelicula {
  id: number;
  titulo: string;
}

interface Sala {
  id: number;
  nombre: string;
  cantidadButacas: number;
}

interface Props {
  sesion: Sesion;
  onFuncionCreada: () => void;
}

export default function AdminFunciones({
  sesion,
  onFuncionCreada,
}: Props) {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);

  const [peliculaId, setPeliculaId] = useState("");
  const [salaId, setSalaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [recarga, setRecarga] = useState(0);

  // Consultar películas y salas existentes.
  useEffect(() => {
    const controller = new AbortController();

    async function cargarDatos() {
      try {
        const [respuestaPeliculas, respuestaSalas] =
          await Promise.all([
            fetch(`${API_URL}/peliculas`, {
              signal: controller.signal,
            }),
            fetch(`${API_URL}/salas`, {
              signal: controller.signal,
            }),
          ]);

        if (!respuestaPeliculas.ok || !respuestaSalas.ok) {
          throw new Error(
            "No se pudieron cargar las películas o salas."
          );
        }

        const datosPeliculas: Pelicula[] =
          await respuestaPeliculas.json();

        const datosSalas: Sala[] =
          await respuestaSalas.json();

        if (controller.signal.aborted) return;

        setPeliculas(datosPeliculas);
        setSalas(datosSalas);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar los datos."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargandoDatos(false);
        }
      }
    }

    void cargarDatos();

    return () => controller.abort();
  }, [recarga]);

  async function crearFuncion(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (guardando || sesion.rol !== "admin") return;

    setError("");
    setExito("");

    const idPelicula = Number(peliculaId);
    const idSala = Number(salaId);

    if (
      !Number.isInteger(idPelicula) ||
      idPelicula <= 0 ||
      !Number.isInteger(idSala) ||
      idSala <= 0 ||
      !fecha ||
      !hora
    ) {
      setError("Completá todos los campos correctamente.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch(
        `${API_URL}/funciones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion.token}`,
          },
          body: JSON.stringify({
            peliculaId: idPelicula,
            salaId: idSala,
            fecha,
            hora,
          }),
        }
      );

      if (!respuesta.ok) {
        let mensaje = "No se pudo crear la función.";

        try {
          const datos = await respuesta.json();

          mensaje =
            datos?.error?.mensaje ??
            datos?.msg ??
            datos?.mensaje ??
            mensaje;
        } catch {
          // Mantener el mensaje predeterminado.
        }

        throw new Error(mensaje);
      }

      setExito("¡Función programada correctamente!");

      setPeliculaId("");
      setSalaId("");
      setFecha("");
      setHora("");

      onFuncionCreada();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al crear la función."
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
        <h2>Gestión de funciones</h2>
        <p>
          Programá horarios para las películas del cine.
        </p>
      </div>

      <div className="admin-formulario">
        <h3>Agregar nueva función</h3>

        <button
          type="button"
          className="btn-actualizar-entradas"
          onClick={() => {
            setError("");
            setCargandoDatos(true);
            setRecarga((actual) => actual + 1);
          }}
          disabled={cargandoDatos || guardando}
        >
          Actualizar películas y salas
        </button>

        {cargandoDatos && (
          <p>Cargando películas y salas...</p>
        )}

        {!cargandoDatos && (
          <form onSubmit={crearFuncion}>
            <div className="admin-campos">
              <label>
                Película
                <select
                  value={peliculaId}
                  onChange={(e) =>
                    setPeliculaId(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Seleccionar película
                  </option>

                  {peliculas.map((pelicula) => (
                    <option
                      key={pelicula.id}
                      value={pelicula.id}
                    >
                      {pelicula.titulo}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Sala
                <select
                  value={salaId}
                  onChange={(e) =>
                    setSalaId(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Seleccionar sala
                  </option>

                  {salas.map((sala) => (
                    <option
                      key={sala.id}
                      value={sala.id}
                    >
                      {sala.nombre} - {sala.cantidadButacas} butacas
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Fecha
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) =>
                    setFecha(e.target.value)
                  }
                  required
                />
              </label>

              <label>
                Horario
                <input
                  type="time"
                  value={hora}
                  onChange={(e) =>
                    setHora(e.target.value)
                  }
                  required
                />
              </label>
            </div>

            {peliculas.length === 0 && (
              <p>No hay películas cargadas.</p>
            )}

            {salas.length === 0 && (
              <p>No hay salas cargadas.</p>
            )}

            <button
              type="submit"
              className="admin-boton"
              disabled={
                guardando ||
                peliculas.length === 0 ||
                salas.length === 0
              }
            >
              {guardando
                ? "Programando función..."
                : "Crear función"}
            </button>
          </form>
        )}

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
      </div>
    </section>
  );
}
