
import { useState, type FormEvent } from "react";

const API_URL = "http://localhost:3001/api";

export interface Sesion {
  uid: number;
  token: string;
  nombre: string;
}

interface Props {
  sesion: Sesion | null;
  onAutenticado: (sesion: Sesion) => void;
  onCerrarSesion: () => void;
}

interface RespuestaAuth {
  ok: boolean;
  uid?: number;
  token?: string;
  msg?: string;
  error?: { mensaje?: string };
}

export default function AuthPanel({
  sesion,
  onAutenticado,
  onCerrarSesion,
}: Props) {
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function enviarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (cargando) return;

    setCargando(true);
    setError("");

    try {
      const endpoint =
        modo === "login" ? "login" : "registro";

      const respuesta = await fetch(
        `${API_URL}/autenticacion/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            modo === "registro"
              ? { nombre, email, password, rol: "cliente" }
              : { email, password }
          ),
        }
      );

      const datos: RespuestaAuth = await respuesta.json();

      if (
        !respuesta.ok ||
        !datos.ok ||
        !datos.token ||
        !Number.isInteger(datos.uid)
      ) {
        throw new Error(
          datos.msg ??
          datos.error?.mensaje ??
          "No se pudo iniciar sesión"
        );
      }

      onAutenticado({
        uid: datos.uid!,
        token: datos.token,
        nombre: modo === "registro" ? nombre : email,
      });

      setPassword("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error de autenticación"
      );
    } finally {
      setCargando(false);
    }
  }

  if (sesion) {
    return (
      <section className="auth-panel">
        <h2>Mi cuenta</h2>
        <p>
          Sesión iniciada como <strong>{sesion.nombre}</strong>
        </p>
        <button
          type="button"
          className="auth-boton"
          onClick={onCerrarSesion}
        >
          Cerrar sesión
        </button>
      </section>
    );
  }

  return (
    <section className="auth-panel">
      <h2>
        {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </h2>

      <form onSubmit={enviarFormulario} className="auth-form">
        {modo === "registro" && (
          <label>
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              maxLength={100}
            />
          </label>
        )}

        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="auth-boton"
          disabled={cargando}
        >
          {cargando
            ? "Procesando..."
            : modo === "login"
              ? "Ingresar"
              : "Registrarme"}
        </button>
      </form>

      <button
        type="button"
        className="auth-cambiar"
        onClick={() => {
          setModo(modo === "login" ? "registro" : "login");
          setError("");
        }}
      >
        {modo === "login"
          ? "¿No tenés cuenta? Registrate"
          : "¿Ya tenés cuenta? Iniciá sesión"}
      </button>
    </section>
  );
}
