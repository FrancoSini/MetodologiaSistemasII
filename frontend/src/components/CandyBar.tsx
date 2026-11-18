
import { useEffect, useRef, useState } from "react";
import type { Sesion } from "./AuthPanel";

const API_URL = "http://localhost:3001/api";

type MedioPago = "efectivo" | "debito" | "credito";

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number | string;
  stock: number;
}

interface ItemCarrito {
  productoId: number;
  cantidad: number;
}

interface Compra {
  id: number;
  estado: string;
  total: number | string;
}

interface RespuestaCrearCompra {
  mensaje: string;
  compra: Compra;
}

interface RespuestaPago {
  aprobado: boolean;
  mensaje: string;
  compra: Compra;
}

interface Props {
  sesion: Sesion | null;
}

async function leerRespuesta<T>(respuesta: Response): Promise<T> {
  const datos: unknown = await respuesta.json();

  if (!respuesta.ok) {
    const error = datos as {
      mensaje?: string;
      msg?: string;
      error?: { mensaje?: string };
    };

    throw new Error(
      error?.error?.mensaje ??
        error?.mensaje ??
        error?.msg ??
        `Error del servidor (${respuesta.status})`
    );
  }

  return datos as T;
}

function formatearPrecio(valor: number): string {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
}

export default function CandyBar({ sesion }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [medioPago, setMedioPago] =
    useState<MedioPago>("efectivo");

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [compraPendiente, setCompraPendiente] =
    useState<Compra | null>(null);

  const [compraConfirmada, setCompraConfirmada] =
    useState<Compra | null>(null);

  const [recarga, setRecarga] = useState(0);

  // Evita dos solicitudes simultáneas por doble clic.
  const operacionEnCurso = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarProductos() {
      setCargando(true);

      try {
        const respuesta = await fetch(
          `${API_URL}/productos`,
          { signal: controller.signal }
        );

        const datos = await leerRespuesta<Producto[]>(respuesta);

        if (!controller.signal.aborted) {
          setProductos(datos);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los productos."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    void cargarProductos();

    return () => controller.abort();
  }, [recarga]);

  function agregarAlCarrito(producto: Producto) {
    if (compraPendiente || procesando || producto.stock <= 0) {
      return;
    }

    setCompraConfirmada(null);
    setMensaje("");

    setCarrito((anterior) => {
      const existente = anterior.find(
        (item) => item.productoId === producto.id
      );

      if (existente) {
        if (existente.cantidad >= producto.stock) {
          return anterior;
        }

        return anterior.map((item) =>
          item.productoId === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...anterior,
        { productoId: producto.id, cantidad: 1 },
      ];
    });
  }

  function disminuirCantidad(productoId: number) {
    if (compraPendiente || procesando) return;

    setCarrito((anterior) =>
      anterior
        .map((item) =>
          item.productoId === productoId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }

  function quitarDelCarrito(productoId: number) {
    if (compraPendiente || procesando) return;

    setCarrito((anterior) =>
      anterior.filter(
        (item) => item.productoId !== productoId
      )
    );
  }

  const itemsCarrito = carrito.flatMap((item) => {
    const producto = productos.find(
      (p) => p.id === item.productoId
    );

    if (!producto) return [];

    return [{ producto, cantidad: item.cantidad }];
  });

  const total = itemsCarrito.reduce(
    (acumulado, { producto, cantidad }) =>
      acumulado + Number(producto.precio) * cantidad,
    0
  );

  const carritoValido =
    carrito.length > 0 &&
    itemsCarrito.length === carrito.length &&
    itemsCarrito.every(
      ({ producto, cantidad }) =>
        Number.isInteger(cantidad) &&
        cantidad > 0 &&
        cantidad <= producto.stock &&
        Number.isFinite(Number(producto.precio)) &&
        Number(producto.precio) >= 0
    );

  async function crearCompra(): Promise<void> {
    if (
      !sesion ||
      sesion.rol !== "cliente" ||
      !carritoValido ||
      compraPendiente ||
      operacionEnCurso.current
    ) {
      return;
    }

    operacionEnCurso.current = true;
    setProcesando(true);
    setError("");
    setMensaje("");
    setCompraConfirmada(null);

    try {
      const respuesta = await fetch(`${API_URL}/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({
          medioPago,
          productos: carrito.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
          })),
          entradas: [],
        }),
      });

      const datos =
        await leerRespuesta<RespuestaCrearCompra>(respuesta);

      if (!Number.isInteger(datos.compra?.id)) {
        throw new Error(
          "El servidor no devolvió un identificador de compra válido."
        );
      }

      setCompraPendiente(datos.compra);
      setMensaje(
        `Compra #${datos.compra.id} creada. ` +
          "Está pendiente de pago."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la compra."
      );
    } finally {
      operacionEnCurso.current = false;
      setProcesando(false);
    }
  }

  async function pagarCompra(
    simularRechazo: boolean
  ): Promise<void> {
    if (
      !sesion ||
      !compraPendiente ||
      operacionEnCurso.current
    ) {
      return;
    }

    operacionEnCurso.current = true;
    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch(
        `${API_URL}/compras/${compraPendiente.id}/pagar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion.token}`,
          },
          body: JSON.stringify({ simularRechazo }),
        }
      );

      const datos =
        await leerRespuesta<RespuestaPago>(respuesta);

      if (datos.aprobado) {
        setCompraConfirmada(datos.compra);
        setCompraPendiente(null);
        setCarrito([]);
        setMensaje(
          `¡Pago aprobado! Compra #${datos.compra.id} confirmada.`
        );
        setRecarga((actual) => actual + 1);
      } else {
        // El backend cancela la compra rechazada.
        // Permitimos que el cliente cree otra si quiere.
        setCompraPendiente(null);
        setMensaje(
          `${datos.mensaje}. La compra fue cancelada.`
        );
        setRecarga((actual) => actual + 1);
      }
    } catch (err) {
      // Conservamos el ID pendiente: no creamos otra
      // compra automáticamente al fallar una solicitud.
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo procesar el pago."
      );
    } finally {
      operacionEnCurso.current = false;
      setProcesando(false);
    }
  }

  return (
    <section className="candy-bar">
      <h2>🍿 Candy Bar</h2>
      <p>Elegí algo rico para acompañar tu película.</p>

      <button
        type="button"
        className="candy-actualizar"
        onClick={() => {
          setError("");
          setRecarga((actual) => actual + 1);
        }}
        disabled={cargando || procesando}
      >
        Actualizar productos
      </button>

      {cargando && <p>Cargando productos...</p>}

      {error && (
        <p className="candy-bar-error" role="alert">
          {error}
        </p>
      )}

      {mensaje && (
        <p role="status" aria-live="polite">
          {mensaje}
        </p>
      )}

      {!cargando && productos.length === 0 && !error && (
        <p>No hay productos disponibles.</p>
      )}

      <div className="candy-bar-grid">
        {productos.map((producto) => {
          const cantidadEnCarrito =
            carrito.find(
              (item) => item.productoId === producto.id
            )?.cantidad ?? 0;

          const disponible =
            producto.stock > 0 &&
            cantidadEnCarrito < producto.stock;

          return (
            <article
              key={producto.id}
              className="candy-bar-card"
            >
              <span>{producto.categoria}</span>
              <h3>{producto.nombre}</h3>

              <p className="candy-bar-precio">
                {formatearPrecio(Number(producto.precio))}
              </p>

              <p>
                {producto.stock > 0
                  ? `Stock: ${producto.stock}`
                  : "Sin stock"}
              </p>

              <button
                type="button"
                className="candy-agregar"
                disabled={
                  !disponible ||
                  cargando ||
                  procesando ||
                  compraPendiente !== null
                }
                onClick={() => agregarAlCarrito(producto)}
              >
                {disponible
                  ? "Agregar al carrito"
                  : "Sin disponibilidad"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="candy-carrito">
        <h3>🛒 Mi carrito</h3>

        {carrito.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <>
            {itemsCarrito.map(({ producto, cantidad }) => (
              <div
                className="candy-carrito-item"
                key={producto.id}
              >
                <div>
                  <strong>{producto.nombre}</strong>
                  <p>
                    {formatearPrecio(
                      Number(producto.precio) * cantidad
                    )}
                  </p>
                </div>

                <div className="candy-controles">
                  <button
                    type="button"
                    disabled={!!compraPendiente || procesando}
                    onClick={() =>
                      disminuirCantidad(producto.id)
                    }
                    aria-label={`Disminuir ${producto.nombre}`}
                  >
                    −
                  </button>

                  <span>{cantidad}</span>

                  <button
                    type="button"
                    disabled={
                      !!compraPendiente ||
                      procesando ||
                      cantidad >= producto.stock
                    }
                    onClick={() => agregarAlCarrito(producto)}
                    aria-label={`Aumentar ${producto.nombre}`}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className="candy-quitar"
                    disabled={!!compraPendiente || procesando}
                    onClick={() =>
                      quitarDelCarrito(producto.id)
                    }
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}

            <div className="candy-total">
              <strong>Total estimado:</strong>
              <strong>{formatearPrecio(total)}</strong>
            </div>

            <p className="candy-aviso">
              El backend verifica el precio y el stock
              al registrar y confirmar la compra.
            </p>

            {!sesion && (
              <p>
                Iniciá sesión como cliente para comprar
                productos del Candy Bar.
              </p>
            )}

            {sesion?.rol === "admin" && (
              <p>
                Para realizar una compra, ingresá con una
                cuenta de cliente.
              </p>
            )}

            {sesion?.rol === "cliente" &&
              !compraPendiente && (
                <>
                  <label htmlFor="candy-medio-pago">
                    Medio de pago
                  </label>

                  <select
                    id="candy-medio-pago"
                    value={medioPago}
                    disabled={procesando}
                    onChange={(evento) =>
                      setMedioPago(
                        evento.target.value as MedioPago
                      )
                    }
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>

                  <button
                    type="button"
                    className="candy-comprar"
                    disabled={
                      !carritoValido ||
                      cargando ||
                      procesando
                    }
                    onClick={() => void crearCompra()}
                  >
                    {procesando
                      ? "Procesando..."
                      : "Crear compra"}
                  </button>
                </>
              )}
          </>
        )}

        {compraPendiente && (
          <div className="candy-pago">
            <h4>
              Compra #{compraPendiente.id} pendiente de pago
            </h4>

            <p>
              Total registrado:{" "}
              <strong>
                {formatearPrecio(
                  Number(compraPendiente.total)
                )}
              </strong>
            </p>

            <p>
              La selección queda bloqueada mientras
              esta compra esté pendiente.
            </p>

            <button
              type="button"
              className="candy-comprar"
              disabled={procesando}
              onClick={() => void pagarCompra(false)}
            >
              {procesando
                ? "Procesando..."
                : "Confirmar pago simulado"}
            </button>

            {import.meta.env.DEV && (
              <button
                type="button"
                className="candy-actualizar"
                disabled={procesando}
                onClick={() => void pagarCompra(true)}
              >
                Simular pago rechazado
              </button>
            )}
          </div>
        )}

        {compraConfirmada && (
          <div className="candy-confirmacion">
            <h4>
              Compra #{compraConfirmada.id} confirmada
            </h4>
            <p>
              Total pagado:{" "}
              {formatearPrecio(
                Number(compraConfirmada.total)
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
