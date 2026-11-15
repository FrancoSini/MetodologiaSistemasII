
import { useEffect, useState, type FormEvent } from "react";
import type { Sesion } from "./AuthPanel";

const API_URL = "http://localhost:3001/api";

interface Sala {
  id: number;
  nombre: string;
  cantidadButacas: number;
}

interface Props {
  sesion: Sesion;
  onSalaCreada: () => void;
}

export default function AdminSalas({
  sesion,
  onSalaCreada,
}: Props) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [nombre, setNombre] = useState("");
  const [filas, setFilas] = useState("6");
  const [butacasPorFila, setButacasPorFila] = useState("10");

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [recarga, setRecarga] = useState(0);

  const cantidadFilas = Number(filas);
  const cantidadPorFila = Number(butacasPorFila);

  const dimensionesValidas =
    Number.isInteger(cantidadFilas) &&
    cantidadFilas >= 1 &&
    cantidadFilas <= 26 &&
    Number.isInteger(cantidadPorFila) &&
    cantidadPorFila >= 1;

  const totalButacas = dimensionesValidas
    ? cantidadFilas * cantidadPorFila
    : 0;

  // Consultar las salas existentes.
  useEffect(() => {
    const controller = new AbortController();

    async function cargarSalas() {
      try {
        const respuesta = await fetch(`${API_URL}/salas`, {
          signal: controller.signal,
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron consultar las salas.");
        }

        const datos: Sala[] = await respuesta.json();

        if (!controller.signal.aborted) {
          setSalas(datos);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar las salas."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    void cargarSalas();

    return () => controller.abort();
  }, [recarga]);

  async function crearSala(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (guardando || sesion.rol !== "admin") return;

    setError("");
    setExito("");

    if (!nombre.trim()) {
      setError("Ingresá un nombre para la sala.");
      return;
    }

    if (!dimensionesValidas) {
      setError(
        "Ingresá entre 1 y 26 filas y al menos " +
        "una butaca por fila."
      );
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch(`${API_URL}/salas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          filas: cantidadFilas,
          butacasPorFila: cantidadPorFila,
        }),
      });

      if (!respuesta.ok) {
        let mensaje = "No se pudo crear la sala.";

        try {
          const datos = await respuesta.json();

          mensaje =
            datos?.error?.mensaje ??
            datos?.msg ??
            datos?.mensaje ??
            mensaje;
        } catch {
          // Conservar mensaje predeterminado.
        }

        throw new Error(mensaje);
      }

      const nuevaSala: Sala = await respuesta.json();

      setExito(
        `¡${nuevaSala.nombre} creada correctamente! ` +
        `Se generaron ${nuevaSala.cantidadButacas} butacas.`
      );

      setNombre("");
      setFilas("6");
      setButacasPorFila("10");

      // Actualizar la lista de salas.
      setRecarga((actual) => actual + 1);

      // Avisar a App para refrescar el selector de funciones.
      onSalaCreada();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al crear la sala."
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
        <h2>Gestión de salas</h2>
        <p>
          Creá nuevas salas y generá sus butacas automáticamente.
        </p>
      </div>

      <div className="admin-formulario">
        <h3>Agregar nueva sala</h3>

        <form onSubmit={crearSala}>
          <label>
            Nombre de la sala
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Sala 2 o Sala VIP"
              maxLength={100}
              required
            />
          </label>

          <div className="admin-campos">
            <label>
              Cantidad de filas
              <input
                type="number"
                min="1"
                max="26"
                step="1"
                value={filas}
                onChange={(e) => setFilas(e.target.value)}
                required
              />
            </label>

            <label>
              Butacas por fila
              <input
                type="number"
                min="1"
                step="1"
                value={butacasPorFila}
                onChange={(e) =>
                  setButacasPorFila(e.target.value)
                }
                required
              />
            </label>
          </div>

          <p>
            <strong>Capacidad total:</strong>{" "}
            {totalButacas} butacas
          </p>

          <p>
            Las filas se identificarán con letras (A, B, C...)
            y las butacas con números.
          </p>

          <button
            type="submit"
            className="admin-boton"
            disabled={guardando || !dimensionesValidas}
          >
            {guardando
              ? "Creando sala..."
              : "Crear sala"}
          </button>
        </form>

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

      <div className="admin-formulario admin-listado-salas">
        <div className="admin-listado-encabezado">
          <h3>Salas existentes</h3>

          <button
            type="button"
            className="btn-actualizar-entradas"
            disabled={cargando || guardando}
            onClick={() => {
              setError("");
              setCargando(true);
              setRecarga((actual) => actual + 1);
            }}
          >
            Actualizar
          </button>
        </div>

        {cargando && <p>Cargando salas...</p>}

        {!cargando && salas.length === 0 && (
          <p>No hay salas registradas.</p>
        )}

        <div className="admin-salas-grid">
          {salas.map((sala) => (
            <article
              key={sala.id}
              className="admin-sala-card"
            >
              <h4>{sala.nombre}</h4>
              <p>
                <strong>ID:</strong> {sala.id}
              </p>
              <p>
                <strong>Capacidad:</strong>{" "}
                {sala.cantidadButacas} butacas
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
