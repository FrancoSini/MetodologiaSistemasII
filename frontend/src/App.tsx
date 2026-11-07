
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

const API_URL = "http://localhost:3001/api";

function App() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

                <p><strong>Género:</strong> {pelicula.genero}</p>
                <p>
                  <strong>Duración:</strong>{" "}
                  {pelicula.duracionMinutos} minutos
                </p>
                <p>
                  <strong>Clasificación:</strong>{" "}
                  {pelicula.clasificacion}
                </p>

                <p className="sinopsis">{pelicula.sinopsis}</p>

                <span className="estado">
                  {pelicula.esProximoEstreno
                    ? "Próximo estreno"
                    : "En cartelera"}
                </span>
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
