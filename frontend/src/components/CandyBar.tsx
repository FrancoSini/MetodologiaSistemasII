
import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001/api";

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

export default function CandyBar() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarProductos() {
      setCargando(true);
      setError("");

      try {
        const respuesta = await fetch(`${API_URL}/productos`, {
          signal: controller.signal,
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los productos.");
        }

        const datos: Producto[] = await respuesta.json();

        if (!controller.signal.aborted) {
          setProductos(datos);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Error inesperado al cargar productos."
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
    if (producto.stock <= 0) return;

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
    setCarrito((anterior) =>
      anterior.filter((item) => item.productoId !== productoId)
    );
  }

  // Solo se consideran productos que siguen existiendo.
  const itemsCarrito = carrito.flatMap((item) => {
    const producto = productos.find(
      (p) => p.id === item.productoId
    );

    if (!producto) return [];

    return [{
      producto,
      cantidad: item.cantidad,
    }];
  });

  const total = itemsCarrito.reduce(
    (acumulado, item) =>
      acumulado + Number(item.producto.precio) * item.cantidad,
    0
  );

  const carritoValido = itemsCarrito.every(
    ({ producto, cantidad }) =>
      Number.isInteger(cantidad) &&
      cantidad > 0 &&
      cantidad <= producto.stock &&
      Number.isFinite(Number(producto.precio))
  );

  const cantidadesValidas =
    carritoValido &&
    itemsCarrito.length === carrito.length;

  function formatearPrecio(valor: number) {
    return valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  }

  return (
    <section className="candy-bar">
      <h2>🍿 Candy Bar</h2>
      <p>Elegí algo rico para acompañar tu película.</p>

      <button
        type="button"
        className="candy-actualizar"
        onClick={() => setRecarga((actual) => actual + 1)}
        disabled={cargando}
      >
        Actualizar productos
      </button>

      {cargando && <p>Cargando productos...</p>}

      {error && (
        <p className="candy-bar-error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && productos.length === 0 && (
        <p>No hay productos disponibles.</p>
      )}

      {!error && (
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
                  disabled={!disponible || cargando}
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
      )}

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
                      cantidad >= producto.stock || cargando
                    }
                    onClick={() => agregarAlCarrito(producto)}
                    aria-label={`Aumentar ${producto.nombre}`}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className="candy-quitar"
                    onClick={() =>
                      quitarDelCarrito(producto.id)
                    }
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}

            {!cantidadesValidas && (
              <p className="candy-bar-error" role="alert">
                El carrito contiene cantidades sin stock
                suficiente o productos que ya no existen.
                Revisá las cantidades antes de comprar.
              </p>
            )}

            <div className="candy-total">
              <strong>Total estimado:</strong>
              <strong>{formatearPrecio(total)}</strong>
            </div>

            <p className="candy-aviso">
              El total definitivo y el stock disponible
              serán verificados por el backend al comprar.
            </p>

            <button
              type="button"
              className="candy-comprar"
              disabled
              title="El pago se habilitará en el siguiente paso"
            >
              Comprar (próximamente)
            </button>
          </>
        )}
      </div>
    </section>
  );
}
