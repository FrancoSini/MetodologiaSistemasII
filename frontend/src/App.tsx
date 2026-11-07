
import { useEffect, useState } from "react";
import "./App.css";

interface Pelicula {
  id: number;
  titulo: string;
  genero: string;
  duracionMinutos: number;
  clasificacion: string;
  sinopsis: string;
  posterUrl: string | null;
  esProximoEstreno: boolean;
}

interface Funcion {
  id: number;
  peliculaId: number;
  salaId: number;
  fecha: string;
  hora: string;
  estado: "programada" | "cancelada";
  Sala?: {
    id: number;
    nombre: string;
    cantidadButacas: number;
  };
}

interface Butaca {
  id: number;
  fila: string;
  numero: number;
  estado: string;
}

const API_URL = "http://localhost:3001/api";

function App() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [funciones, setFunciones] = useState<Funcion[]>([]);
  const [peliculaSeleccionada, setPeliculaSeleccionada] =
    useState<number | null>(null);
  const [cargandoFunciones, setCargandoFunciones] = useState(false);
  const [errorFunciones, setErrorFunciones] = useState("");

  const [funcionSeleccionada, setFuncionSeleccionada] =
    useState<number | null>(null);
  const [butacas, setButacas] = useState<Butaca[]>([]);
  const [butacasSeleccionadas, setButacasSeleccionadas] =
    useState<number[]>([]);
  const [cargandoButacas, setCargandoButacas] = useState(false);
  const [errorButacas, setErrorButacas] = useState("");

  useEffect(() => {
    async function cargarPeliculas() {
      try {
        const respuesta = await fetch(`${API_URL}/peliculas`);

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las películas");
        }

        const datos: Pelicula[] = await respuesta.json();
        setPeliculas(datos);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error desconocido"
        );
      } finally {
        setCargando(false);
      }
    }

    cargarPeliculas();
  }, []);

  // Mostrar u ocultar las funciones de una película.
  function verFunciones(peliculaId: number) {
    setPeliculaSeleccionada(
      peliculaSeleccionada === peliculaId ? null : peliculaId
    );

    setFuncionSeleccionada(null);
    setButacas([]);
    setButacasSeleccionadas([]);
    setErrorButacas("");
  }

  // Cargar las funciones cuando cambia la película seleccionada.
  useEffect(() => {
    if (peliculaSeleccionada === null) return;

    const controller = new AbortController();
    const peliculaId = peliculaSeleccionada;

    async function cargarFunciones() {
      setCargandoFunciones(true);
      setErrorFunciones("");
      setFunciones([]);

      try {
        const respuesta = await fetch(`${API_URL}/funciones`, {
          signal: controller.signal,
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las funciones");
        }

        const datos: Funcion[] = await respuesta.json();

        setFunciones(
          datos.filter(
            (funcion) =>
              funcion.peliculaId === peliculaId &&
              funcion.estado === "programada"
          )
        );
      } catch (error) {
        if (controller.signal.aborted) return;

        setErrorFunciones(
          error instanceof Error
            ? error.message
            : "Error al consultar funciones"
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargandoFunciones(false);
        }
      }
    }

    cargarFunciones();

    return () => controller.abort();
  }, [peliculaSeleccionada]);

  // Mostrar u ocultar las butacas de una función.
  function verButacas(funcionId: number) {
    setFuncionSeleccionada(
      funcionSeleccionada === funcionId ? null : funcionId
    );

    setButacas([]);
    setButacasSeleccionadas([]);
    setErrorButacas("");
  }

  // Consultar las butacas reales de la función.
  useEffect(() => {
    if (funcionSeleccionada === null) return;

    const controller = new AbortController();

    async function cargarButacas() {
      setCargandoButacas(true);
      setErrorButacas("");
      setButacas([]);

      try {
        const respuesta = await fetch(
          `${API_URL}/funciones/${funcionSeleccionada}/butacas`,
          { signal: controller.signal }
        );

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las butacas");
        }

        const datos: Butaca[] = await respuesta.json();
        setButacas(datos);
      } catch (error) {
        if (controller.signal.aborted) return;

        setErrorButacas(
          error instanceof Error
            ? error.message
            : "Error al consultar butacas"
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargandoButacas(false);
        }
      }
    }

    cargarButacas();

    return () => controller.abort();
  }, [funcionSeleccionada]);

  // Selección visual. Todavía no reserva en PostgreSQL.
  function seleccionarButaca(butaca: Butaca) {
    if (butaca.estado !== "disponible") return;

    setButacasSeleccionadas((anteriores) =>
      anteriores.includes(butaca.id)
        ? anteriores.filter((id) => id !== butaca.id)
        : [...anteriores, butaca.id]
    );
  }

  // Agrupar las butacas por fila: A, B, C, etc.
  const filas = [...new Set(butacas.map((butaca) => butaca.fila))].sort();

  const disponibles = butacas.filter(
    (butaca) => butaca.estado === "disponible"
  ).length;

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 Cine Gestión</h1>
        <p>Sistema de Gestión de Cine</p>
      </header>

      <main className="contenido">
        <h2>Cartelera de películas</h2>

        {cargando && <p>Cargando películas...</p>}
        {error && <p className="error">{error}</p>}

        {!cargando && !error && peliculas.length === 0 && (
          <p>No hay películas disponibles.</p>
        )}

        <div className="peliculas-grid">
          {peliculas.map((pelicula) => (
            <article className="pelicula-card" key={pelicula.id}>
              {pelicula.posterUrl ? (
                <img
                  src={pelicula.posterUrl}
                  alt={pelicula.titulo}
                />
              ) : (
                <div className="sin-poster">🎥</div>
              )}

              <div className="pelicula-info">
                <h3>{pelicula.titulo}</h3>

                <p>
                  <strong>Género:</strong> {pelicula.genero}
                </p>

                <p>
                  <strong>Duración:</strong>{" "}
                  {pelicula.duracionMinutos} minutos
                </p>

                <p>
                  <strong>Clasificación:</strong>{" "}
                  {pelicula.clasificacion}
                </p>

                <p className="sinopsis">{pelicula.sinopsis}</p>

                <span
                  className={
                    pelicula.esProximoEstreno
                      ? "estado proximo-estreno"
                      : "estado"
                  }
                >
                  {pelicula.esProximoEstreno
                    ? "Próximo estreno"
                    : "En cartelera"}
                </span>

                <button
                  type="button"
                  className="btn-funciones"
                  onClick={() => verFunciones(pelicula.id)}
                >
                  {peliculaSeleccionada === pelicula.id
                    ? "Ocultar funciones"
                    : "Ver funciones"}
                </button>

                {peliculaSeleccionada === pelicula.id && (
                  <div className="funciones-container">
                    <h4>Funciones disponibles</h4>

                    {cargandoFunciones && (
                      <p>Cargando funciones...</p>
                    )}

                    {errorFunciones && (
                      <p className="error">{errorFunciones}</p>
                    )}

                    {!cargandoFunciones &&
                      !errorFunciones &&
                      funciones.length === 0 && (
                        <p>No hay funciones programadas.</p>
                      )}

                    {!cargandoFunciones &&
                      !errorFunciones &&
                      funciones.map((funcion) => (
                        <div
                          className="funcion-item"
                          key={funcion.id}
                        >
                          <p>
                            <strong>Fecha:</strong>{" "}
                            {funcion.fecha
                              .split("-")
                              .reverse()
                              .join("/")}
                          </p>

                          <p>
                            <strong>Horario:</strong>{" "}
                            {funcion.hora.slice(0, 5)} hs
                          </p>

                          <p>
                            <strong>Sala:</strong>{" "}
                            {funcion.Sala?.nombre ??
                              `Sala ${funcion.salaId}`}
                          </p>

                          <span className="funcion-estado">
                            Programada
                          </span>

                          <button
                            type="button"
                            className="btn-butacas"
                            onClick={() => verButacas(funcion.id)}
                          >
                            {funcionSeleccionada === funcion.id
                              ? "Ocultar butacas"
                              : "Ver butacas"}
                          </button>

                          {funcionSeleccionada === funcion.id && (
                            <div className="butacas-container">
                              <h4>Selección de butacas</h4>

                              {cargandoButacas && (
                                <p>Cargando butacas...</p>
                              )}

                              {errorButacas && (
                                <p className="error">
                                  {errorButacas}
                                </p>
                              )}

                              {!cargandoButacas &&
                                !errorButacas && (
                                  <>
                                    <p>
                                      Disponibles:{" "}
                                      <strong>
                                        {disponibles} de {butacas.length}
                                      </strong>
                                    </p>

                                    <div className="mapa-butacas">
                                      <div className="pantalla-cine">
                                        PANTALLA
                                      </div>

                                      {filas.map((fila) => (
                                        <div
                                          className="fila-butacas"
                                          key={fila}
                                        >
                                          <span className="letra-fila">
                                            {fila}
                                          </span>

                                          {butacas
                                            .filter(
                                              (butaca) =>
                                                butaca.fila === fila
                                            )
                                            .sort(
                                              (a, b) =>
                                                a.numero - b.numero
                                            )
                                            .map((butaca) => {
                                              const seleccionada =
                                                butacasSeleccionadas.includes(
                                                  butaca.id
                                                );

                                              return (
                                                <button
                                                  key={butaca.id}
                                                  type="button"
                                                  disabled={
                                                    butaca.estado !==
                                                    "disponible"
                                                  }
                                                  onClick={() =>
                                                    seleccionarButaca(
                                                      butaca
                                                    )
                                                  }
                                                  className={`butaca ${
                                                    seleccionada
                                                      ? "seleccionada"
                                                      : butaca.estado ===
                                                          "disponible"
                                                        ? "disponible"
                                                        : "ocupada"
                                                  }`}
                                                  aria-pressed={
                                                    seleccionada
                                                  }
                                                  aria-label={`Butaca ${butaca.fila}${butaca.numero}, ${
                                                    seleccionada
                                                      ? "seleccionada"
                                                      : butaca.estado
                                                  }`}
                                                  title={`${butaca.fila}${butaca.numero}: ${butaca.estado}`}
                                                >
                                                  {butaca.numero}
                                                </button>
                                              );
                                            })}
                                        </div>
                                      ))}
                                    </div>

                                    <div className="leyenda-butacas">
                                      <span>🟢 Disponible</span>
                                      <span>🔵 Seleccionada</span>
                                      <span>🔴 No disponible</span>
                                    </div>

                                    <div className="resumen-butacas">
                                      <strong>
                                        Butacas seleccionadas:{" "}
                                        {butacasSeleccionadas.length}
                                      </strong>

                                      {butacasSeleccionadas.length > 0 && (
                                        <p>
                                          {butacas
                                            .filter((butaca) =>
                                              butacasSeleccionadas.includes(
                                                butaca.id
                                              )
                                            )
                                            .map(
                                              (butaca) =>
                                                `${butaca.fila}${butaca.numero}`
                                            )
                                            .join(", ")}
                                        </p>
                                      )}

                                      <small>
                                        La selección es visual y todavía
                                        no registra reservas.
                                      </small>
                                    </div>
                                  </>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>Metodología de Sistemas II - UTN 2026</p>
      </footer>
    </div>
  );
}

export default App;
