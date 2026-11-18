
import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001/api";

interface Producto {
  id: number;
  nombre: string;
  precio: number | string;
  stock: number;
  categoria: string;
}

export default function CandyBar() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const cargarProductos = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/productos`, {
          signal: controller.signal,
        });

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los productos");
        }

        const datos: Producto[] = await respuesta.json();
        if (!controller.signal.aborted) {
          setProductos(datos);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Error inesperado"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    void cargarProductos();
    return () => controller.abort();
  }, []);

  return (
    <section className="candy-bar">
      <h2>🍿 Candy Bar</h2>
      <p>Elegí algo rico para acompañar tu película.</p>

      {cargando && <p>Cargando productos...</p>}

      {error && <p role="alert" className="candy-bar-error">{error}</p>}

      {!cargando && !error && productos.length === 0 && (
        <p>No hay productos disponibles.</p>
      )}

      <div className="candy-bar-grid">
        {productos.map((producto) => (
          <article key={producto.id} className="candy-bar-card">
            <span>{producto.categoria}</span>
            <h3>{producto.nombre}</h3>

            <p className="candy-bar-precio">
              ${Number(producto.precio).toLocaleString("es-AR")}
            </p>

            <p>
              {producto.stock > 0
                ? `Stock disponible: ${producto.stock}`
                : "Sin stock"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
