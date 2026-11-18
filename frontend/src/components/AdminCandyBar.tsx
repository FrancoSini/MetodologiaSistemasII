
import { useEffect, useState, type FormEvent } from "react";
import type { Sesion } from "./AuthPanel";

const API_URL = "http://localhost:3001/api";

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number | string;
  stock: number;
}

interface Props {
  sesion: Sesion;
  onProductoCreado: () => void;
}

export default function AdminCandyBar({
  sesion,
  onProductoCreado,
}: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarProductos() {
      setCargando(true);

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
              : "Error al consultar productos."
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

  async function crearProducto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (guardando || sesion.rol !== "admin") return;

    setError("");
    setExito("");

    const precioNumero = Number(precio);
    const stockNumero = Number(stock);

    if (!nombre.trim() || !categoria.trim()) {
      setError("Completá el nombre y la categoría.");
      return;
    }

    if (
      precio.trim() === "" ||
      !Number.isFinite(precioNumero) ||
      precioNumero < 0
    ) {
      setError("Ingresá un precio válido.");
      return;
    }

    if (
      stock.trim() === "" ||
      !Number.isInteger(stockNumero) ||
      stockNumero < 0
    ) {
      setError("El stock debe ser un entero mayor o igual a cero.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sesion.token}`,
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          categoria: categoria.trim(),
          precio: precioNumero,
          stock: stockNumero,
        }),
      });

      if (!respuesta.ok) {
        let mensaje = "No se pudo crear el producto.";

        try {
          const datos = await respuesta.json();
          mensaje =
            datos?.error?.mensaje ??
            datos?.msg ??
            datos?.mensaje ??
            mensaje;
        } catch {
          // Conservar el mensaje original.
        }

        throw new Error(mensaje);
      }

      const nuevoProducto: Producto = await respuesta.json();

      setExito(
        `¡${nuevoProducto.nombre} agregado correctamente!`
      );

      setNombre("");
      setCategoria("");
      setPrecio("");
      setStock("");

      setRecarga((actual) => actual + 1);
      onProductoCreado();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al crear el producto."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (sesion.rol !== "admin") return null;

  return (
    <section className="admin-panel">
      <div className="admin-encabezado">
        <h2>🍿 Administración del Candy Bar</h2>
        <p>Gestioná los productos disponibles en el cine.</p>
      </div>

      <div className="admin-formulario">
        <h3>Agregar producto</h3>

        <form onSubmit={crearProducto}>
          <label>
            Nombre del producto
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Pochoclos grandes"
              maxLength={100}
              required
            />
          </label>

          <label>
            Categoría
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej: Pochoclos"
              maxLength={100}
              required
            />
          </label>

          <div className="admin-campos">
            <label>
              Precio ($)
              <input
                type="number"
                min="0"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
              />
            </label>

            <label>
              Stock
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="admin-boton"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Agregar producto"}
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

      <div className="admin-formulario">
        <h3>Productos registrados</h3>

        <button
          type="button"
          className="btn-actualizar-entradas"
          disabled={cargando || guardando}
          onClick={() => {
            setError("");
            setRecarga((actual) => actual + 1);
          }}
        >
          Actualizar productos
        </button>

        {cargando && <p>Cargando productos...</p>}

        {!cargando && productos.length === 0 && (
          <p>No hay productos registrados.</p>
        )}

        <div className="candy-bar-grid">
          {productos.map((producto) => (
            <article
              key={producto.id}
              className="candy-bar-card"
            >
              <h3>{producto.nombre}</h3>
              <p>Categoría: {producto.categoria}</p>
              <p>
                Precio: $
                {Number(producto.precio).toLocaleString("es-AR")}
              </p>
              <p>Stock: {producto.stock}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
