

import { useEffect, useState } from "react";
import type { Sesion } from "./AuthPanel";

const API_URL = "http://localhost:3001/api";

interface Entrada {
  id: number;
  compraId: number;
  funcionButacaId: number;
  codigo: string;
}

interface Props {
  sesion: Sesion;
  compraActualId?: number;
}

export default function MisEntradas({
  sesion,
  compraActualId,
}: Props) {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [actualizaciones, setActualizaciones] = useState(0);

  const { token } = sesion;

  // Consultar entradas del usuario autenticado.
  useEffect(() => {
    const controller = new AbortController();

    async function consultarEntradas() {
      try {
        // El estado se actualiza de forma asincrónica,
        // evitando setState directo en el efecto.
        await Promise.resolve();

        if (controller.signal.aborted) return;

        setCargando(true);
        setError("");

        const respuesta = await fetch(
          `${API_URL}/entradas/mis-entradas`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!respuesta.ok) {
          let mensaje = "No se pudieron cargar las entradas";

          try {
            const datos = await respuesta.json();

            mensaje =
              datos?.error?.mensaje ??
              datos?.mensaje ??
              mensaje;
          } catch {
            // Mantener el mensaje predeterminado.
          }

          throw new Error(mensaje);
        }

        const datos: unknown = await respuesta.json();

        if (!Array.isArray(datos)) {
          throw new Error(
            "El servidor devolvió un formato inesperado"
          );
        }

        if (!controller.signal.aborted) {
          setEntradas(datos as Entrada[]);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar las entradas"
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    void consultarEntradas();

    return () => {
      controller.abort();
    };
  }, [token, compraActualId, actualizaciones]);

  function actualizarEntradas() {
    setActualizaciones((anterior) => anterior + 1);
  }

  return (
    <section className="mis-entradas">
      <div className="mis-entradas-encabezado">
        <h2>🎟️ Mis entradas</h2>

        <button
          type="button"
          className="btn-actualizar-entradas"
          onClick={actualizarEntradas}
          disabled={cargando}
        >
          {cargando ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {cargando && <p>Cargando tus entradas...</p>}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && entradas.length === 0 && (
        <p>
          Todavía no tenés entradas emitidas.
          Cuando confirmes una compra, aparecerán acá.
        </p>
      )}

      {!error && (
        <div className="entradas-grid">
          {entradas.map((entrada) => (
            <article
              key={entrada.id}
              className="entrada-card"
            >
              <h3>🎫 Entrada #{entrada.id}</h3>

              <p>
                <strong>Compra:</strong> #{entrada.compraId}
              </p>

              <p>
                <strong>ID de butaca en función:</strong>{" "}
                {entrada.funcionButacaId}
              </p>

              <p>
                <strong>Código de entrada:</strong>
              </p>

              <code className="codigo-entrada">
                {entrada.codigo}
              </code>

              <p className="entrada-nota">
                Entrada emitida por el sistema.
                Conservá este código como comprobante.
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
