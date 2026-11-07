
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

  // Obtener todas las películas desde el backend.
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
            : "Error desconocido al cargar películas"
        );
      } finally {
        setCargando(false);
      }
    }

    cargarPeliculas();
  }, []);

  // Consultar funciones de la película seleccionada.
  async function verFunciones(peliculaId: number) {
    // Si ya está seleccionada, ocultamos las funciones.
    if (peliculaSeleccionada === peliculaId) {
      setPeliculaSeleccionada(null);
      return;
    }

    setPeliculaSeleccionada(peliculaId);
    setCargandoFunciones(true);
    setErrorFunciones("");
    setFunciones([]);

    try {
      const respuesta = await fetch(`${API_URL}/funciones`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las funciones");
      }

      const datos: Funcion[] = await respuesta.json();

      // Mostrar únicamente funciones programadas
      // de la película seleccionada.
      const funcionesDePelicula = datos.filter(
        (funcion) =>
          funcion.peliculaId === peliculaId &&
          funcion.estado === "programada"
      );

      setFunciones(funcionesDePelicula);
    } catch (error) {
      setErrorFunciones(
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar funciones"
      );
    } finally {
      setCargandoFunciones(false);
    }
  }

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
              {/* Imagen de la película */}
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

                <p className="sinopsis">
                  {pelicula.sinopsis}
                </p>

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

                {/* Botón para mostrar las funciones */}
                <button
                  type="button"
                  className="btn-funciones"
                  onClick={() => verFunciones(pelicula.id)}
                >
                  {peliculaSeleccionada === pelicula.id
                    ? "Ocultar funciones"
                    : "Ver funciones"}
                </button>

                {/* Funciones de la película */}
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
