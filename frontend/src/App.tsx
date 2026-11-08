
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

interface Reserva {
  id: number;
  venceEn: string;
  estado: string;
}

interface Comprobante {
  compraId: number;
  pelicula: string;
  fecha: string;
  hora: string;
  sala: string;
  butacas: string[];
  total: number;
  venceEn: string | null;
}

const API_URL = "http://localhost:3001/api";

// Datos exclusivos para pruebas locales.
const USUARIO_PRUEBA_ID = 1;
const PRECIO_BUTACA = 5000;

function formatearFecha(fecha: string) {
  return fecha.split("-").reverse().join("/");
}

function formatearImporte(importe: number) {
  return importe.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

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
    // Mantener el mensaje predeterminado.
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
  const [errorReserva, setErrorReserva] = useState("");
  const [comprobante, setComprobante] =
    useState<Comprobante | null>(null);

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
          error instanceof Error
            ? error.message
            : "Error desconocido al cargar películas"
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarPeliculas();

    return () => controller.abort();
  }, []);

  // Mostrar u ocultar funciones.
  function verFunciones(peliculaId: number) {
    if (reservaEnCurso.current) return;

    setPeliculaSeleccionada((actual) =>
      actual === peliculaId ? null : peliculaId
    );

    setFuncionSeleccionada(null);
    setButacas([]);
    setButacasSeleccionadas([]);
    setErrorButacas("");
    setErrorReserva("");
  }

  // Cargar funciones programadas.
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

  // Mostrar u ocultar el mapa de butacas.
  function verButacas(funcionId: number) {
    if (reservaEnCurso.current) return;

    setFuncionSeleccionada((actual) =>
      actual === funcionId ? null : funcionId
    );

    setButacas([]);
    setButacasSeleccionadas([]);
    setErrorButacas("");
    setErrorReserva("");
  }

  // Cargar las butacas reales.
  useEffect(() => {
    if (funcionSeleccionada === null) return;

    const controller = new AbortController();
    const funcionId = funcionSeleccionada;

    async function cargarButacas() {
      setCargandoButacas(true);
      setErrorButacas("");
      setButacas([]);

      try {
        const respuesta = await fetch(
          `${API_URL}/funciones/${funcionId}/butacas`,
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

  // Actualizar la disponibilidad desde PostgreSQL.
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

    const disponibles = new Set(
      datos
        .filter((butaca) => butaca.estado === "disponible")
        .map((butaca) => butaca.id)
    );

    setButacasSeleccionadas((anteriores) =>
      anteriores.filter((id) => disponibles.has(id))
    );
  }

  // Selección visual de butacas.
  function seleccionarButaca(butaca: Butaca) {
    if (reservando || butaca.estado !== "disponible") return;

    setErrorReserva("");

    setButacasSeleccionadas((anteriores) =>
      anteriores.includes(butaca.id)
        ? anteriores.filter((id) => id !== butaca.id)
        : [...anteriores, butaca.id]
    );
  }

  // Crear compra y reservar las butacas seleccionadas.
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
    setErrorReserva("");
    setComprobante(null);

    const idsButacas = [...butacasSeleccionadas];

    const nombresButacas = butacas
      .filter((butaca) => idsButacas.includes(butaca.id))
      .map((butaca) => `${butaca.fila}${butaca.numero}`);

    const funcion = funciones.find((f) => f.id === funcionId);

    const pelicula = peliculas.find(
      (p) => p.id === funcion?.peliculaId
    );

    const reservasRealizadas: number[] = [];
    const vencimientos: number[] = [];
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

      if (
        !Number.isInteger(compra.id) ||
        compra.id <= 0 ||
        compra.estado !== "pendiente"
      ) {
        throw new Error("La compra creada no es válida");
      }

      compraId = compra.id;

      // 2. Reservar una por una.
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

        const reserva: Reserva = await respuestaReserva.json();
        const vencimiento = new Date(reserva.venceEn).getTime();

        if (Number.isFinite(vencimiento)) {
          vencimientos.push(vencimiento);
        }
      }

      // 3. Guardar los datos del comprobante.
      // Se usa el vencimiento más cercano.
      const vencimientoMasCercano =
        vencimientos.length > 0
          ? new Date(Math.min(...vencimientos)).toISOString()
          : null;

      setComprobante({
        compraId,
        pelicula: pelicula?.titulo ?? "Película",
        fecha: funcion?.fecha ?? "",
        hora: funcion?.hora ?? "",
        sala:
          funcion?.Sala?.nombre ??
          `Sala ${funcion?.salaId ?? ""}`,
        butacas: nombresButacas,
        total: idsButacas.length * PRECIO_BUTACA,
        venceEn: vencimientoMasCercano,
      });

      setButacasSeleccionadas([]);
    } catch (error) {
      const motivo =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al reservar";

      const liberacionesFallidas: number[] = [];

      // Intentar revertir las reservas ya realizadas.
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
              "No se pudo liberar la reserva"
            );
          } catch {
            liberacionesFallidas.push(butacaId);
          }
        }
      }

      let mensaje = motivo;

      if (compraId !== null) {
        mensaje += ` La compra pendiente #${compraId} quedó creada.`;

        if (liberacionesFallidas.length > 0) {
          mensaje +=
            " No se pudieron liberar todas las butacas. " +
            "Revisá las reservas antes de repetir la operación.";
        } else if (reservasRealizadas.length > 0) {
          mensaje +=
            " Se intentó liberar las reservas realizadas.";
        }
      }

      setErrorReserva(mensaje);
    } finally {
      try {
        await actualizarButacas(funcionId);
        setErrorButacas("");
      } catch {
        setErrorButacas(
          "No se pudo actualizar la disponibilidad. " +
            "Cerrá y volvé a abrir el mapa antes de reservar."
        );
      }

      reservaEnCurso.current = false;
      setReservando(false);
    }
  }

  const filas = [...new Set(butacas.map((b) => b.fila))].sort();

  const disponibles = butacas.filter(
    (b) => b.estado === "disponible"
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

        {/* COMPROBANTE DE RESERVA PENDIENTE */}
        {comprobante && (
          <section className="comprobante" aria-live="polite">
            <div className="comprobante-encabezado">
              <h3>Reserva registrada</h3>
              <span className="etiqueta-pendiente">
                Compra pendiente
              </span>
            </div>

            <p className="comprobante-aviso">
              Tus butacas fueron reservadas temporalmente.
              Este comprobante no es una entrada y no acredita
              un pago.
            </p>

            <div className="comprobante-datos">
              <p>
                <strong>Compra:</strong> #{comprobante.compraId}
              </p>
              <p>
                <strong>Película:</strong> {comprobante.pelicula}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {formatearFecha(comprobante.fecha)}
              </p>
              <p>
                <strong>Horario:</strong>{" "}
                {comprobante.hora.slice(0, 5)} hs
              </p>
              <p>
                <strong>Sala:</strong> {comprobante.sala}
              </p>
              <p>
                <strong>Butacas:</strong>{" "}
                {comprobante.butacas.join(", ")}
              </p>
              <p>
                <strong>Total de prueba:</strong>{" "}
                {formatearImporte(comprobante.total)}
              </p>
              <p>
                <strong>Vencimiento:</strong>{" "}
                {comprobante.venceEn
                  ? new Date(
                      comprobante.venceEn
                    ).toLocaleString("es-AR")
                  : "Consultar disponibilidad"}
              </p>
            </div>

            <p className="comprobante-nota">
              La reserva vence automáticamente según el
              backend. Este comprobante muestra el resultado
              registrado en esta sesión, no confirma que
              la reserva siga vigente.
            </p>
          </section>
        )}

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
                            {formatearFecha(funcion.fecha)}
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
                                !errorButacas &&
                                butacas.length === 0 && (
                                  <p>
                                    No hay butacas para mostrar.
                                  </p>
                                )}

                              {!cargandoButacas &&
                                butacas.length > 0 && (
                                  <>
                                    <p>
                                      Disponibles:{" "}
                                      <strong>
                                        {disponibles} de{" "}
                                        {butacas.length}
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
                                              (b) => b.fila === fila
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
                                            .filter((b) =>
                                              butacasSeleccionadas.includes(
                                                b.id
                                              )
                                            )
                                            .map(
                                              (b) =>
                                                `${b.fila}${b.numero}`
                                            )
                                            .join(", ")}
                                        </p>
                                      )}

                                      <p>
                                        <strong>
                                          Total de prueba:{" "}
                                          {formatearImporte(
                                            totalSeleccionado
                                          )}
                                        </strong>
                                      </p>

                                      <small>
                                        Precio ficticio. No se
                                        procesan pagos reales.
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
