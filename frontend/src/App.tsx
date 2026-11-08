
import { useEffect, useRef, useState } from "react";
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

interface Compra {
  id: number;
  estado: string;
}

const API_URL = "http://localhost:3001/api";

// Configuración únicamente para pruebas locales.
const USUARIO_PRUEBA_ID = 1;
const PRECIO_BUTACA = 5000;

// Obtener el mensaje de error devuelto por el backend.
async function verificarRespuesta(
  respuesta: Response,
  mensajePredeterminado: string
) {
  if (respuesta.ok) return;

  let mensaje = mensajePredeterminado;

  try {
    const datos = await respuesta.json();
    mensaje = datos?.error?.mensaje ?? datos?.mensaje ?? mensaje;
  } catch {
    // Usamos el mensaje predeterminado.
  }

  throw new Error(mensaje);
}

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

  const [reservando, setReservando] = useState(false);
  const [mensajeReserva, setMensajeReserva] = useState("");
  const [errorReserva, setErrorReserva] = useState("");

  // Evita enviar dos reservas por doble clic.
  const reservaEnCurso = useRef(false);

  // Cargar películas.
  useEffect(() => {
    const controller = new AbortController();

    async function cargarPeliculas() {
      try {
        const respuesta = await fetch(`${API_URL}/peliculas`, {
          signal: controller.signal,
        });

        await verificarRespuesta(
          respuesta,
          "No se pudieron cargar las películas"
        );

        const datos: Pelicula[] = await respuesta.json();
        setPeliculas(datos);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    cargarPeliculas();

    return () => controller.abort();
  }, []);

  // Mostrar u ocultar funciones.
  function verFunciones(peliculaId: number) {
    if (reservaEnCurso.current) return;

    setPeliculaSeleccionada(
      peliculaSeleccionada === peliculaId ? null : peliculaId
    );

    setFuncionSeleccionada(null);
    setButacas([]);
    setButacasSeleccionadas([]);
    setMensajeReserva("");
    setErrorReserva("");
    setErrorButacas("");
  }

  // Consultar las funciones programadas.
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

        await verificarRespuesta(
          respuesta,
          "No se pudieron cargar las funciones"
        );

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

  // Mostrar u ocultar butacas.
  function verButacas(funcionId: number) {
    if (reservaEnCurso.current) return;

    setFuncionSeleccionada(
      funcionSeleccionada === funcionId ? null : funcionId
    );

    setButacas([]);
    setButacasSeleccionadas([]);
    setMensajeReserva("");
    setErrorReserva("");
    setErrorButacas("");
  }

  // Consultar butacas al elegir una función.
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

        await verificarRespuesta(
          respuesta,
          "No se pudieron cargar las butacas"
        );

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

  // Volver a consultar la disponibilidad real.
  async function actualizarButacas(funcionId: number) {
    const respuesta = await fetch(
      `${API_URL}/funciones/${funcionId}/butacas`
    );

    await verificarRespuesta(
      respuesta,
      "No se pudo actualizar la disponibilidad"
    );

    const datos: Butaca[] = await respuesta.json();

    setButacas(datos);

    // Quitar selecciones que dejaron de estar disponibles.
    const idsDisponibles = new Set(
      datos
        .filter((butaca) => butaca.estado === "disponible")
        .map((butaca) => butaca.id)
    );

    setButacasSeleccionadas((anteriores) =>
      anteriores.filter((id) => idsDisponibles.has(id))
    );
  }

  // Seleccionar o deseleccionar una butaca.
  function seleccionarButaca(butaca: Butaca) {
    if (reservando || butaca.estado !== "disponible") return;

    setMensajeReserva("");
    setErrorReserva("");

    setButacasSeleccionadas((anteriores) =>
      anteriores.includes(butaca.id)
        ? anteriores.filter((id) => id !== butaca.id)
        : [...anteriores, butaca.id]
    );
  }

  // Reservar las butacas seleccionadas en PostgreSQL.
  async function reservarButacas(funcionId: number) {
    if (
      reservaEnCurso.current ||
      butacasSeleccionadas.length === 0 ||
      funcionSeleccionada !== funcionId
    ) {
      return;
    }

    reservaEnCurso.current = true;
    setReservando(true);
    setMensajeReserva("");
    setErrorReserva("");

    const idsButacas = [...butacasSeleccionadas];
    const reservasRealizadas: number[] = [];

    let compraId: number | null = null;

    try {
      // 1. Crear una compra pendiente.
      const respuestaCompra = await fetch(`${API_URL}/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuarioId: USUARIO_PRUEBA_ID,
          medioPago: "efectivo",
          total: idsButacas.length * PRECIO_BUTACA,
        }),
      });

      await verificarRespuesta(
        respuestaCompra,
        "No se pudo crear la compra"
      );

      const compra: Compra = await respuestaCompra.json();

      if (compra.estado !== "pendiente") {
        throw new Error("La compra creada no está pendiente");
      }

      compraId = compra.id;

      // 2. Reservar cada butaca seleccionada.
      for (const butacaId of idsButacas) {
        const respuestaReserva = await fetch(
          `${API_URL}/funciones/${funcionId}/butacas/${butacaId}/reservar`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ compraId }),
          }
        );

        await verificarRespuesta(
          respuestaReserva,
          `No se pudo reservar la butaca ${butacaId}`
        );

        reservasRealizadas.push(butacaId);
      }

      // 3. Informar el resultado.
      setButacasSeleccionadas([]);

      setMensajeReserva(
        `¡Reserva realizada! Compra pendiente #${compraId}. ` +
          `${reservasRealizadas.length} butaca(s) reservada(s) ` +
          "por 15 minutos. Todavía no se confirmó el pago."
      );
    } catch (error) {
      const mensajeOriginal =
        error instanceof Error
          ? error.message
          : "Ocurrió un error durante la reserva";

      // Si se reservaron algunas butacas, intentar liberarlas.
      const liberacionesFallidas: number[] = [];

      if (compraId !== null) {
        for (const butacaId of reservasRealizadas) {
          try {
            const respuestaLiberar = await fetch(
              `${API_URL}/funciones/${funcionId}/butacas/${butacaId}/liberar`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ compraId }),
              }
            );

            await verificarRespuesta(
              respuestaLiberar,
              "No se pudo liberar una reserva"
            );
          } catch {
            liberacionesFallidas.push(butacaId);
          }
        }
      }

      let mensaje = mensajeOriginal;

      if (compraId !== null) {
        mensaje += ` La compra pendiente #${compraId} quedó creada.`;

        if (liberacionesFallidas.length > 0) {
          mensaje +=
            " No se pudieron liberar todas las butacas. " +
            "Revisá la compra y la disponibilidad antes de reintentar.";
        } else if (reservasRealizadas.length > 0) {
          mensaje +=
            " Se intentó liberar las butacas reservadas " +
            "en esta operación.";
        }
      }

      setErrorReserva(mensaje);
    } finally {
      // Refrescar disponibilidad tanto en éxito como en error.
      try {
        await actualizarButacas(funcionId);
        setErrorButacas("");
      } catch {
        setErrorButacas(
          "No se pudo actualizar la disponibilidad. " +
            "Ocultá y volvé a abrir las butacas antes de reservar."
        );
      }

      reservaEnCurso.current = false;
      setReservando(false);
    }
  }

  // Agrupar las butacas por fila.
  const filas = [...new Set(butacas.map((butaca) => butaca.fila))].sort();

  const disponibles = butacas.filter(
    (butaca) => butaca.estado === "disponible"
  ).length;

  const totalSeleccionado =
    butacasSeleccionadas.length * PRECIO_BUTACA;

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
                  disabled={reservando}
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
                            disabled={reservando}
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
                                butacas.length === 0 &&
                                !errorButacas && (
                                  <p>No hay butacas disponibles para mostrar.</p>
                                )}

                              {!cargandoButacas &&
                                butacas.length > 0 && (
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
                                                    reservando ||
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
                                                  aria-label={`Butaca ${butaca.fila}${butaca.numero}: ${
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

                                      <p>
                                        <strong>
                                          Total de prueba: $
                                          {totalSeleccionado.toLocaleString(
                                            "es-AR"
                                          )}
                                        </strong>
                                      </p>

                                      <small>
                                        Precio ficticio. La reserva no
                                        confirma el pago ni genera
                                        entradas.
                                      </small>

                                      <button
                                        type="button"
                                        className="btn-reservar"
                                        disabled={
                                          reservando ||
                                          cargandoButacas ||
                                          !!errorButacas ||
                                          butacasSeleccionadas.length === 0
                                        }
                                        onClick={() =>
                                          reservarButacas(funcion.id)
                                        }
                                      >
                                        {reservando
                                          ? "Procesando reserva..."
                                          : "Reservar butacas seleccionadas"}
                                      </button>
                                    </div>

                                    {mensajeReserva && (
                                      <div
                                        className="mensaje-exito"
                                        role="status"
                                      >
                                        {mensajeReserva}
                                      </div>
                                    )}

                                    {errorReserva && (
                                      <p
                                        className="error"
                                        role="alert"
                                      >
                                        {errorReserva}
                                      </p>
                                    )}
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
