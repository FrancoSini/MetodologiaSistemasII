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

function obtenerMensajeError(datos: unknown, predeterminado: string): string {
  if (!datos || typeof datos !== "object") return predeterminado;
  const respuesta = datos as {
    error?: { mensaje?: string } | string;
    mensaje?: string;
    msg?: string;
  };
  if (typeof respuesta.error === "object" && typeof respuesta.error?.mensaje === "string") {
    return respuesta.error.mensaje;
  }
  if (typeof respuesta.error === "string") return respuesta.error;
  return respuesta.mensaje ?? respuesta.msg ?? predeterminado;
}

export default function AdminCandyBar({ sesion, onProductoCreado }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [productoEnEdicion, setProductoEnEdicion] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
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
        if (!respuesta.ok) throw new Error("No se pudieron cargar los productos.");
        const datos: Producto[] = await respuesta.json();
        if (!controller.signal.aborted) {
          setProductos(datos);
          setError("");
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Error al consultar productos.");
        }
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    void cargarProductos();
    return () => controller.abort();
  }, [recarga]);

  function limpiarFormulario() {
    setNombre("");
    setCategoria("");
    setPrecio("");
    setStock("");
    setProductoEnEdicion(null);
  }

  function comenzarEdicion(producto: Producto) {
    if (guardando || eliminandoId !== null) return;
    setProductoEnEdicion(producto.id);
    setNombre(producto.nombre);
    setCategoria(producto.categoria);
    setPrecio(String(producto.precio));
    setStock(String(producto.stock));
    setError("");
    setExito("");
  }

  async function guardarProducto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando || eliminandoId !== null || sesion.rol !== "admin") return;

    setError("");
    setExito("");

    const precioNumero = Number(precio);
    const stockNumero = Number(stock);

    if (!nombre.trim() || !categoria.trim()) {
      setError("Completá el nombre y la categoría.");
      return;
    }
    if (precio.trim() === "" || !Number.isFinite(precioNumero) || precioNumero < 0) {
      setError("Ingresá un precio válido.");
      return;
    }
    if (stock.trim() === "" || !Number.isInteger(stockNumero) || stockNumero < 0) {
      setError("El stock debe ser un entero mayor o igual a cero.");
      return;
    }

    const editando = productoEnEdicion !== null;
    const idEdicion = productoEnEdicion;
    setGuardando(true);

    try {
      const respuesta = await fetch(
        editando ? `${API_URL}/productos/${idEdicion}` : `${API_URL}/productos`,
        {
          method: editando ? "PUT" : "POST",
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
        }
      );

      if (!respuesta.ok) {
        let mensaje = editando
          ? "No se pudo actualizar el producto."
          : "No se pudo crear el producto.";
        try {
          mensaje = obtenerMensajeError(await respuesta.json(), mensaje);
        } catch {
          // Conservar el mensaje original.
        }
        throw new Error(mensaje);
      }

      const productoGuardado: Producto = await respuesta.json();
      setExito(
        editando
          ? `¡${productoGuardado.nombre} actualizado correctamente!`
          : `¡${productoGuardado.nombre} agregado correctamente!`
      );
      limpiarFormulario();
      setRecarga((actual) => actual + 1);
      onProductoCreado();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error al guardar el producto."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProducto(producto: Producto) {
    if (guardando || eliminandoId !== null || sesion.rol !== "admin") return;

    const confirmado = window.confirm(
      `¿Querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setError("");
    setExito("");
    setEliminandoId(producto.id);

    try {
      const respuesta = await fetch(`${API_URL}/productos/${producto.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sesion.token}` },
      });

      if (!respuesta.ok) {
        let mensaje = "No se pudo eliminar el producto.";
        try {
          mensaje = obtenerMensajeError(await respuesta.json(), mensaje);
        } catch {
          // Algunos errores no incluyen una respuesta JSON.
        }
        if (respuesta.status === 409 && mensaje === "No se pudo eliminar el producto.") {
          mensaje = "No se puede eliminar el producto porque tiene compras asociadas.";
        }
        throw new Error(mensaje);
      }

      // El backend devuelve HTTP 204 sin cuerpo: no llamar a respuesta.json().
      if (productoEnEdicion === producto.id) limpiarFormulario();
      setProductos((actuales) => actuales.filter((item) => item.id !== producto.id));
      setExito(`Producto "${producto.nombre}" eliminado correctamente.`);
      onProductoCreado(); // También refresca el catálogo público.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el producto.");
    } finally {
      setEliminandoId(null);
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
        <h3>{productoEnEdicion === null ? "Agregar producto" : "Editar producto"}</h3>

        <form onSubmit={guardarProducto}>
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
          <button type="submit" className="admin-boton" disabled={guardando || eliminandoId !== null}>
            {guardando
              ? "Guardando..."
              : productoEnEdicion === null
                ? "Agregar producto"
                : "Guardar cambios"}
          </button>
          {productoEnEdicion !== null && (
            <button
              type="button"
              className="btn-actualizar-entradas"
              disabled={guardando || eliminandoId !== null}
              onClick={() => {
                limpiarFormulario();
                setError("");
                setExito("");
              }}
            >
              Cancelar edición
            </button>
          )}
        </form>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {exito && <p className="admin-exito" role="status">{exito}</p>}
      </div>

      <div className="admin-formulario">
        <h3>Productos registrados</h3>
        <button
          type="button"
          className="btn-actualizar-entradas"
          disabled={cargando || guardando || eliminandoId !== null}
          onClick={() => {
            setError("");
            setRecarga((actual) => actual + 1);
          }}
        >
          Actualizar productos
        </button>

        {cargando && <p>Cargando productos...</p>}
        {!cargando && productos.length === 0 && <p>No hay productos registrados.</p>}

        <div className="candy-bar-grid">
          {productos.map((producto) => (
            <article key={producto.id} className="candy-bar-card">
              <h3>{producto.nombre}</h3>
              <p>Categoría: {producto.categoria}</p>
              <p>
                Precio: ${Number(producto.precio).toLocaleString("es-AR")}
              </p>
              <p>Stock: {producto.stock}</p>
              <button
                type="button"
                className="btn-actualizar-entradas"
                disabled={guardando || eliminandoId !== null}
                onClick={() => comenzarEdicion(producto)}
              >
                Editar
              </button>
              <button
                type="button"
                className="boton-rechazar"
                disabled={guardando || eliminandoId !== null}
                onClick={() => void eliminarProducto(producto)}
              >
                {eliminandoId === producto.id ? "Eliminando..." : "Eliminar"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
