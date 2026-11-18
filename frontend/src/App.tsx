import { useEffect, useRef, useState } from "react";
import "./App.css";
import AuthPanel, { type Sesion } from "./components/AuthPanel";
import MisEntradas from "./components/MisEntradas";
import AdminPanel from "./components/AdminPanel";
import AdminFunciones from "./components/AdminFunciones";
import AdminSalas from "./components/AdminSalas";
import CandyBar from "./components/CandyBar";
import AdminCandyBar from "./components/AdminCandyBar"; 

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
  estado: "pendiente" | "confirmada" | "cancelada";
  total: number | string;
  medioPago: "efectivo" | "debito" | "credito";
}

interface RespuestaCrearCompra {
  mensaje: string;
  compra: Compra;
}



interface Comprobante {
  compraId: number;
  pelicula: string;
  fecha: string;
  hora: string;
  sala: string;
  butacas: string[];
  total: number;
}
interface ResultadoPago {
  aprobado: boolean;
  mensaje: string;
  entradasEmitidas?: number;
}

const API_URL = "http://localhost:3001/api";

// Datos exclusivos para pruebas locales.
// Precio de referencia mostrado antes de crear la compra.
// El importe definitivo lo calcula el backend.
const PRECIO_BUTACA = 9000;

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
 
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [resultadoPago, setResultadoPago] =
    useState<ResultadoPago | null>(null);
  const [errorPago, setErrorPago] = useState("");

  const reservaEnCurso = useRef(false);
  const pagoEnCurso = useRef(false);
  const [sesion, setSesion] = useState<Sesion | null>(null);

  const [recargaFunciones, setRecargaFunciones] = useState(0);

  const [versionSalas, setVersionSalas] = useState(0);
  const [versionProductos, setVersionProductos] = useState(0);

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
  }, [peliculaSeleccionada, recargaFunciones]);

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
  async function actualizarCartelera() {
    const respuesta = await fetch(`${API_URL}/peliculas`);

    await verificarRespuesta(
      respuesta,
      "No se pudo actualizar la cartelera"
    );

    const datos: Pelicula[] = await respuesta.json();
    setPeliculas(datos);
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

    if (!sesion) {
      setErrorReserva(
        "Tenés que iniciar sesión para reservar butacas."
      );
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

    try {
      // El backend crea la compra y realiza las reservas.
      const respuesta = await fetch(`${API_URL}/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({
          medioPago: "efectivo",
          productos: [],
          entradas: idsButacas.map((id) => ({
            funcionButacaId: id,
          })),
        }),
      });

      await verificarRespuesta(
        respuesta,
        "No se pudo crear la compra"
      );

      const datos: RespuestaCrearCompra =
        await respuesta.json();

      const compra = datos.compra;

      if (
        !compra ||
        !Number.isInteger(compra.id) ||
        compra.id <= 0 ||
        compra.estado !== "pendiente"
      ) {
        throw new Error(
          "El backend devolvió una compra inválida."
        );
      }

      const total = Number(compra.total);

      if (!Number.isFinite(total)) {
        throw new Error(
          "No se pudo interpretar el total de la compra."
        );
      }

      setResultadoPago(null);
      setErrorPago("");
      setComprobante({
        compraId: compra.id,
        pelicula: pelicula?.titulo ?? "Película",
        fecha: funcion?.fecha ?? "",
        hora: funcion?.hora ?? "",
        sala:
          funcion?.Sala?.nombre ??
          `Sala ${funcion?.salaId ?? ""}`,
        butacas: nombresButacas,
        total,
      });

      setButacasSeleccionadas([]);
    } catch (error) {
      setErrorReserva(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear la compra."
      );
    } finally {
      try {
        await actualizarButacas(funcionId);
        setErrorButacas("");
      } catch {
        setErrorButacas(
          "No se pudo actualizar la disponibilidad. " +
          "Volvé a abrir el mapa antes de reservar."
        );
      }

      reservaEnCurso.current = false;
      setReservando(false);
    }
  }

  // Procesar el pago simulado de la compra pendiente.
  async function pagarCompra(simularRechazo = false) {
    if (!sesion || !comprobante || pagoEnCurso.current || resultadoPago) {
      return;
    }

    const compraId = comprobante.compraId;
    pagoEnCurso.current = true;
    setProcesandoPago(true);
    setErrorPago("");

    try {
      const respuesta = await fetch(`${API_URL}/compras/${compraId}/pagar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({ simularRechazo }),
      });

      await verificarRespuesta(respuesta, "No se pudo procesar el pago");
      const datos: ResultadoPago = await respuesta.json();

      if (typeof datos.aprobado !== "boolean") {
        throw new Error("El backend devolvió una respuesta de pago inválida.");
      }

      // El backend ya confirmó o canceló la compra; no volver a pagarla.
      setResultadoPago({
        aprobado: datos.aprobado,
        mensaje: datos.mensaje ?? (datos.aprobado ? "Pago aprobado" : "Pago rechazado"),
        entradasEmitidas: datos.entradasEmitidas,
      });
    } catch (error) {
      // Ante una respuesta incierta, no reintentar automáticamente el pago.
      setErrorPago(
        (error instanceof Error ? error.message : "Error al procesar el pago") +
          ". Si no sabés si se procesó, verificá la compra antes de reintentar."
      );
    } finally {
      try {
        if (funcionSeleccionada !== null) {
          await actualizarButacas(funcionSeleccionada);
          setErrorButacas("");
        }
      } catch {
        setErrorButacas("No se pudo actualizar el mapa de butacas. Recargá la función.");
      }
      pagoEnCurso.current = false;
      setProcesandoPago(false);
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
        <AuthPanel
          sesion={sesion}
          onAutenticado={setSesion}
          onCerrarSesion={() => {
            setSesion(null);
            setComprobante(null);
            setResultadoPago(null);
            setErrorPago("");
          }}
        />
        {sesion?.rol === "admin" && (
          <AdminPanel
            sesion={sesion}
            onPeliculaCreada={actualizarCartelera}
          />
        )}
        {sesion?.rol === "admin" && (
          <>
            <AdminSalas
              sesion={sesion}
              onSalaCreada={() => {
                setVersionSalas((actual) => actual + 1);
              }}
            />

            <AdminFunciones
              key={versionSalas}
              sesion={sesion}
              onFuncionCreada={() => {
                setRecargaFunciones((actual) => actual + 1);
              }}
            />

            <AdminCandyBar
              sesion={sesion}
              onProductoCreado={() => {
                setVersionProductos((actual) => actual + 1);
              }}
            />
          </>
        )}

        {sesion && (
          <MisEntradas
            key={sesion.uid}
            sesion={sesion}
            compraActualId={
              resultadoPago?.aprobado
                ? comprobante?.compraId
                : undefined
            }
          />
        )}
        <CandyBar
            key={`${sesion?.uid ?? "invitado"}-${versionProductos}`}
            sesion={sesion}     
        />
        <h2>Cartelera de películas</h2>
        {/* COMPROBANTE DE RESERVA PENDIENTE */}
        {comprobante && (
          <section className="comprobante" aria-live="polite">
            <div className="comprobante-encabezado">
              <h3>
                {resultadoPago?.aprobado
                  ? "Compra confirmada"
                  : resultadoPago
                    ? "Compra cancelada"
                    : "Reserva registrada"}
              </h3>
              <span className="etiqueta-pendiente">
                {resultadoPago?.aprobado
                  ? "Pago aprobado"
                  : resultadoPago
                    ? "Pago rechazado"
                    : "Compra pendiente"}
              </span>
            </div>

            <p className="comprobante-aviso">
              {resultadoPago?.aprobado
                ? "El pago simulado fue aprobado. El backend confirmó la compra y procesó las entradas."
                : resultadoPago
                  ? "El pago simulado fue rechazado. La compra fue cancelada."
                  : "Tus butacas fueron reservadas temporalmente. Este comprobante no es una entrada y no acredita un pago."}
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
                <strong>Total de la compra:</strong>{" "}
                {formatearImporte(comprobante.total)}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {resultadoPago?.aprobado
                  ? "Confirmada"
                  : resultadoPago
                    ? "Cancelada"
                    : "Pendiente de pago"}
              </p>
            </div>

            {!resultadoPago && (
              <p className="comprobante-nota">
                Las reservas vencen automáticamente según el backend.
                El comprobante no confirma que sigan vigentes.
                El pago es simulado y no implica un cobro real.
              </p>
            )}

            <div className="acciones-pago">
              {!resultadoPago ? (
                <>
                  <button
                    type="button"
                    className="boton-pagar"
                    onClick={() => pagarCompra(false)}
                    disabled={procesandoPago || !sesion}
                  >
                    {procesandoPago ? "Procesando pago..." : "Confirmar pago simulado"}
                  </button>
                  <button
                    type="button"
                    className="boton-rechazar"
                    onClick={() => pagarCompra(true)}
                    disabled={procesandoPago || !sesion}
                  >
                    Simular pago rechazado
                  </button>
                </>
              ) : (
                <div className={resultadoPago.aprobado ? "pago-aprobado" : "pago-rechazado"} role="status">
                  <h4>{resultadoPago.aprobado ? "Pago aprobado" : "Pago rechazado"}</h4>
                  <p>{resultadoPago.mensaje}</p>
                  {resultadoPago.aprobado ? (
                    <p>
                      Entradas emitidas: <strong>{resultadoPago.entradasEmitidas ?? "Sin informar"}</strong>
                    </p>
                  ) : (
                    <p>El backend canceló la compra y liberó las reservas activas.</p>
                  )}
                  {resultadoPago.aprobado && (
                    <small>Esta pantalla es un comprobante del pago simulado, no presenta los códigos individuales de entrada.</small>
                  )}
                </div>
              )}
              {errorPago && <p className="error" role="alert">{errorPago}</p>}
            </div>
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
                                          style={{
                                            gridTemplateColumns: `16px repeat(${
                                              butacas.filter((b) => b.fila === fila).length
                                            }, 36px)`,
                                          }}
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
                                          Total estimado:{" "}
                                          {formatearImporte(
                                            totalSeleccionado
                                          )}
                                        </strong>
                                      </p>

                                      <small>
                                        Precio orientativo. El backend calcula el total.
                                        No se procesan pagos reales.
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
