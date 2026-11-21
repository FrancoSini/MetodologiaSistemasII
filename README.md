# 🎬 Sistema de Gestión de Cine

Sistema web para la gestión integral de un cine, permitiendo consultar la cartelera, próximos estrenos, funciones disponibles, selección de butacas, compra de entradas y productos del Candy Bar desde una única plataforma.

El sistema contará además con un panel administrativo para gestionar películas, salas, funciones, butacas, productos y ventas.

---

## 🎯 Qué problema resuelve

Hoy en día gestionar un cine implica coordinar varias cosas a la vez: qué películas están en cartelera, en qué salas y horarios se proyectan, qué butacas están disponibles para cada función, y la venta de entradas y productos de Candy Bar, todo evitando errores como vender dos veces la misma butaca para la misma función.

Este proyecto busca centralizar esa gestión en una sola plataforma: por un lado, un panel administrativo para que el cine cargue y mantenga la información (películas, salas, funciones, productos, ventas); por otro, una experiencia simple para que el cliente consulte la cartelera, elija su función, seleccione butacas, sume productos del Candy Bar y complete la compra.

---

## 👥 Integrantes

* Lucía Agüero
* Mateo Barrera
* Joaquín Pignotti
* Franco Sinigaglia

---

## 🛠️ Tecnología elegida

### Frontend
* **React 19** — Librería para la construcción de la interfaz.
* **TypeScript** — Tipado estático para el código del cliente.
* **Vite** — Herramienta de desarrollo y compilación del frontend.

### Backend
* **Node.js** — Entorno de ejecución del servidor.
* **Express.js 5** — Framework para el desarrollo de la API REST.
* **TypeScript** — Tipado estático también en el servidor.

### Base de datos
* **PostgreSQL 16** — Sistema gestor de base de datos.
* **Sequelize** — ORM para la comunicación entre Node.js y PostgreSQL.

### Seguridad
* **JWT** (`jsonwebtoken`) — Autenticación de usuarios.
* **bcrypt** — Encriptación de contraseñas.

### Herramientas
* **Git / GitHub** — Control de versiones y trabajo colaborativo.
* **Docker / Docker Compose** — Hoy levanta la base de datos PostgreSQL (ver [Docker](#-docker)).
* **Postman** — Pruebas sobre la API REST.

> Esta selección de tecnologías fue definida por el equipo para el Taller 1. Puede ajustarse si durante el desarrollo aparece una necesidad concreta que lo justifique.

---

## 📦 Cómo instalar dependencias

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd gestion-cine

# Instalar dependencias del backend
cd backend
npm ci

# Instalar dependencias del frontend
cd ../frontend
npm ci
```

El repositorio incluye un archivo `.env.example` con las variables de entorno necesarias (puerto, conexión a PostgreSQL, secreto de JWT, origen permitido para CORS, etc.). Cada integrante debe copiarlo como `.env` y completar sus valores locales. El backend lee el `.env` de la carpeta desde la que se ejecuta, por lo que conviene dejarlo en `backend/`:

```bash
Copy-Item .env.example backend/.env  # PowerShell
```

Los datos de conexión a la base (`DB_NAME`, `DB_USER`, `DB_PASSWORD`) deben coincidir con los de `docker-compose.yml`. Además hay que definir un `JWT_SECRET` propio y no publicar archivos `.env`. Si PostgreSQL ocupa el puerto 5432 en la computadora, se puede cambiar solo el **puerto del host** a `5433:5432` y configurar `DB_PORT=5433` en `backend/.env`. No subir credenciales ni configuraciones locales sin coordinarlo con el equipo.

> Requisito declarado por ambos `package.json`: **Node.js 24 o superior**. Se necesitan Docker Desktop, Git y npm.

---

## ▶️ Cómo ejecutar el proyecto

**1. Base de datos (PostgreSQL con Docker):**

```bash
docker compose up -d db
```

**2. Backend** (en `http://localhost:3001`):

```bash
cd backend
npm run dev
```

Al iniciar, el backend se conecta a PostgreSQL y crea las tablas que falten (no borra ni modifica las existentes). Para comprobar que funciona:

```text
GET http://localhost:3001/api/salud
```

**3. Frontend** (en otra terminal, normalmente en `http://localhost:5173`):

```bash
cd frontend
npm run dev
```

> Si el puerto 5173 está ocupado, Vite puede usar otro como `5174`. En ese caso, actualizar `CORS_ORIGIN` en `backend/.env` para que coincida con el origen real del navegador y reiniciar el backend. El frontend probado en `feature/frontend-cine` consulta `http://localhost:3001/api` de forma fija en `App.tsx`; no se configura todavía mediante `VITE_API_URL`.

> **Estado por rama:** en `Read-Me` se documenta el estado integrado en esta rama; en `feature/frontend-cine` ya se desarrollaron cartelera, funciones, mapa y reserva de butacas, comprobante de compra pendiente y mejoras responsive. Estos cinco commits **aún no figuran incorporados** a `Read-Me` según la comparación de ramas del 08/11/2026. No confundir código desarrollado con código fusionado.

---

## 📌 Estado actual y pendientes conocidos

**Estado actual:** proyecto en desarrollo con funcionalidades repartidas en ramas. `feature/frontend-cine` tiene un frontend conectado a la API con reserva de butacas y comprobante de compra pendiente; la integración con `Read-Me`/`dev` debe verificarse con Git antes de asumir que está disponible allí. El circuito de confirmación de compra/pago y emisión de entradas en el frontend sigue pendiente.

| Módulo | Estado |
| --- | --- |
| Modelo de datos | ✅ Implementado; incluye reservas de butacas en la rama de trabajo más reciente |
| Películas, salas y funciones | ✅ Implementado (consulta y alta) |
| Generación de butacas (por sala y por función) | ✅ Implementado |
| Manejo central de errores | ✅ Implementado |
| Productos, compras y entradas | 🟡 Controllers y rutas básicos; falta el flujo completo |
| Autenticación (registro/login con JWT) | 🟡 Controller y middlewares hechos; las rutas todavía no están montadas |
| Pagos simulados | ⏳ Pendiente (el medio de pago se registra en la compra, sin procesamiento) |
| Reservas de butacas | ✅ Backend con reservas de 15 minutos e índice único para reserva activa, probado en rama de trabajo |
| Frontend | ✅ Cartelera, funciones, butacas, reservas y comprobante desarrollados en `feature/frontend-cine`; integración a otras ramas pendiente |

**Pendientes conocidos:**

* [ ] Definir y bocetar el diseño de las pantallas principales (cartelera, selección de butacas, checkout).
* [x] Modelar la base de datos (usuarios, películas, salas, funciones, butacas, compras, entradas, productos).
* [x] Definir la estructura de carpetas del backend (la del frontend queda pendiente).
* [x] Configurar el proyecto base de backend (Express + Sequelize) y frontend (React + TypeScript + Vite).
* [ ] Completar el `docker-compose.yml` (hoy solo levanta PostgreSQL; faltan backend y frontend).
* [ ] Implementar la simulación del módulo de pagos (débito, crédito, efectivo).
* [ ] Montar las rutas de autenticación y aplicar los middlewares de token y rol.
* [x] Implementar los módulos de películas, funciones y salas (consulta y alta).
* [ ] Completar películas, salas y funciones con edición y baja (`PUT` / `DELETE`).
* [x] Exponer las butacas de cada función (`GET /api/funciones/:id/butacas`) en la rama de trabajo del backend.
* [x] Implementar selección visual y reserva con control de disponibilidad en `feature/frontend-cine` y servicios de backend (integración a otras ramas pendiente).
* [ ] Implementar Candy Bar y flujo de compra completo (hoy el total llega desde el cliente y no se validan butacas).
* [ ] Armar colección de Postman para pruebas de la API.
* [ ] Agregar datos de prueba (seeders) y tests automáticos.
* [x] Manejo central de errores (`AppError` + `errorHandler`).

---

## 🏗️ Arquitectura

El sistema sigue una arquitectura cliente-servidor basada en una API REST.

```text
┌─────────────────────────────────┐
│            FRONTEND             │
│  React + TypeScript + Vite      │
│                                  │
│  Cartelera                      │
│  Próximos estrenos              │
│  Funciones                      │
│  Selección de butacas           │
│  Candy Bar                      │
│  Compras                        │
└───────────────┬─────────────────┘
                │
                │ HTTP / JSON
                ▼
┌─────────────────────────────────┐
│             BACKEND              │
│  Node.js + Express + TypeScript  │
│                                  │
│  Autenticación                  │
│  Películas                      │
│  Funciones                      │
│  Salas                          │
│  Butacas                        │
│  Compras                        │
│  Candy Bar                      │
│  Usuarios                       │
└───────────────┬─────────────────┘
                │
                │ Sequelize
                ▼
┌─────────────────────────────────┐
│           PostgreSQL             │
│                                  │
│  Usuarios                       │
│  Películas                      │
│  Salas                          │
│  Butacas                        │
│  Funciones                      │
│  Compras                        │
│  Entradas                       │
│  Productos                      │
└─────────────────────────────────┘
```

### Capas del backend

```text
routes  →  controllers  →  services  →  models
```

* **routes:** conectan cada URL con su controller.
* **controllers:** leen la petición HTTP y devuelven la respuesta.
* **services:** contienen reglas de negocio que se reutilizan (por ejemplo, generar las butacas de una sala o de una función).
* **models:** definen las tablas y relaciones con Sequelize.
* **middlewares y utils:** autenticación, manejo de errores y funciones de apoyo.

### Estado de cada butaca por función

Una butaca física existe una sola vez, pero su estado (`disponible`, `reservada`, `vendida`) se guarda **por función** en la tabla `FuncionButaca`. Un índice único sobre (función, butaca) impide duplicar un mismo asiento en la misma función. Al crear una función se generan automáticamente todas sus butacas como `disponible`.

### Manejo de errores

Toda respuesta de error sale con el mismo formato:

```json
{ "error": { "mensaje": "Sala no encontrada" } }
```

Los errores esperados se lanzan con `AppError` (mensaje y código HTTP) y el `errorHandler` los convierte en respuesta. Códigos que maneja: `400` (datos o ids inválidos, referencias inexistentes), `404` (recurso o ruta inexistente), `409` (el recurso ya existe) y `500` (error interno).

---

## 👤 Roles de usuario

El sistema contará inicialmente con dos roles principales.

### Administrador

Podrá:

* Gestionar usuarios.
* Gestionar películas.
* Gestionar próximos estrenos.
* Gestionar salas.
* Gestionar butacas.
* Crear y modificar funciones.
* Gestionar productos del Candy Bar.
* Consultar ventas.
* Consultar estadísticas del cine.

### Cliente

Podrá:

* Registrarse.
* Iniciar sesión.
* Gestionar su perfil.
* Consultar la cartelera.
* Consultar próximos estrenos.
* Consultar funciones.
* Seleccionar una función.
* Seleccionar butacas.
* Comprar entradas.
* Agregar productos del Candy Bar.
* Realizar el pago.
* Consultar sus compras.
* Consultar sus entradas.

---

## 🎥 Funcionalidades principales

### Gestión de usuarios

* Registro de usuarios.
* Inicio de sesión.
* Autenticación mediante JWT.
* Gestión de perfiles.
* Roles y permisos.
* Control de acceso.

### Gestión de películas

* Crear, editar, eliminar y consultar películas.
* Agregar género, duración, clasificación, sinopsis, poster y trailer.
* Marcar películas como próximas a estrenar.

### Cartelera

Los clientes podrán consultar películas disponibles, información de cada película, funciones disponibles, horarios y salas.

### Próximos estrenos

Visualización de películas próximas a estrenarse, fecha de estreno, información, trailer, género y sinopsis.

### Gestión de salas

El administrador podrá crear, modificar y eliminar salas, configurar la cantidad de butacas y consultar su distribución.

### Gestión de funciones

El administrador podrá crear, modificar y eliminar funciones, asociarlas a una película y una sala, definir fecha y horario, y consultar funciones disponibles.

### Selección de butacas

1. Seleccionar una película.
2. Seleccionar una función.
3. Visualizar la distribución de la sala.
4. Consultar las butacas disponibles.
5. Seleccionar una o más butacas.
6. Continuar con la compra.

El sistema deberá evitar que una misma butaca sea vendida para la misma función a más de un cliente.

### 🎟️ Compra de entradas

Seleccionar función, seleccionar butacas, revisar el resumen de compra, confirmar la compra, realizar el pago y obtener las entradas.

### 🍿 Candy Bar

Productos como pochoclos, gaseosas, agua, golosinas y combos.

El administrador podrá crear, modificar y eliminar productos, modificar precios y gestionar stock.
El cliente podrá consultar productos, seleccionarlos, definir cantidades y agregarlos a su compra.

### 💳 Pagos

Se simulará el proceso de pago, permitiendo elegir entre los siguientes medios:

* Tarjeta de débito.
* Tarjeta de crédito.
* Efectivo.

La simulación será simple: no se integrará con una pasarela de pago real, sino que se registrará el medio elegido y se confirmará la compra.

### 🎫 Entradas

Luego de realizar una compra, el sistema generará una entrada asociada a película, función, sala, butaca, usuario, fecha de compra y código de entrada.

---

## 🔄 Flujo principal de compra

```text
Usuario
   │
   ▼
Selecciona película
   │
   ▼
Selecciona función
   │
   ▼
Selecciona butacas
   │
   ▼
Agrega productos del Candy Bar
   │
   ▼
Revisa compra
   │
   ▼
Realiza pago
   │
   ▼
Compra confirmada
   │
   ▼
Obtiene sus entradas
```

---

## 🌐 API REST

El backend expone una API REST para la comunicación entre el frontend y el servidor. Referencias: ✅ implementado · ⏳ pendiente (propuesta inicial, puede modificarse a medida que avance el desarrollo).

### Estado del servidor
```text
GET    /api/salud                    ✅  Comprueba que el backend y la base responden
```

### Autenticación
```text
POST   /api/autenticacion/registro   ⏳  (controller hecho, ruta sin montar)
POST   /api/autenticacion/login      ⏳  (controller hecho, ruta sin montar)
```

### Películas
```text
GET    /api/peliculas                ✅  (filtro opcional: ?proximoEstreno=true|false)
GET    /api/peliculas/:id            ✅
POST   /api/peliculas                ✅
PUT    /api/peliculas/:id            ⏳
DELETE /api/peliculas/:id            ⏳
```

### Salas
```text
GET    /api/salas                    ✅
GET    /api/salas/:id                ✅  (incluye sus butacas)
POST   /api/salas                    ✅  (crea la sala y sus butacas: filas y butacasPorFila)
PUT    /api/salas/:id                ⏳
DELETE /api/salas/:id                ⏳
```

### Funciones
```text
GET    /api/funciones                ✅  (incluye película y sala)
GET    /api/funciones/:id            ✅
POST   /api/funciones                ✅  (genera las butacas de la función como "disponible")
PUT    /api/funciones/:id            ⏳
DELETE /api/funciones/:id            ⏳
```

### Butacas
```text
GET    /api/funciones/:id/butacas    ⏳
POST   /api/funciones/:id/butacas    ⏳
```

### Productos / Candy Bar
```text
GET    /api/productos                ✅
GET    /api/productos/:id            ✅
POST   /api/productos                ✅
PUT    /api/productos/:id            ⏳
DELETE /api/productos/:id            ⏳
```

### Compras
```text
GET    /api/compras                  ✅
GET    /api/compras/:id              ✅
POST   /api/compras                  ✅  (registro básico; falta validar butacas y calcular el total)
```

### Entradas
```text
GET    /api/entradas                 ✅
GET    /api/entradas/:id             ✅
POST   /api/entradas                 ✅
```

---

## 🐳 Docker

Docker facilita la configuración del entorno de desarrollo. Hoy el archivo `docker-compose.yml` levanta **solo la base de datos** (PostgreSQL 16, base `gestion_cine`, volumen persistente). El puerto de host puede ser 5432 o 5433 según la configuración local de cada integrante:

```bash
docker compose up -d db
```

Todavía no hay contenedores para el backend ni para el frontend: se ejecutan de forma manual con `npm run dev`. Completar el `docker-compose.yml` con ambos servicios es un pendiente.

---

## 🧪 Pruebas

Se utilizará **Postman** para realizar pruebas sobre la API REST, comprobando respuestas HTTP, registro de usuarios, autenticación, creación/actualización/eliminación de recursos, validaciones, manejo de errores, autorización según roles, relaciones entre entidades, disponibilidad de butacas y registro de compras.

Las pruebas del flujo frontend/backend se realizaron **manualmente** mediante PowerShell y navegador. No hay un conjunto de tests automáticos propio verificado para estas ramas; la ejecución de `npm test` en backend todavía no configura pruebas reales. Algunos casos a revisar:

| Pedido | Respuesta esperada |
| --- | --- |
| `GET /api/salas/abc` | `400` — "El ID debe ser un número entero positivo" |
| `GET /api/salas/99` (inexistente) | `404` — "Sala no encontrada" |
| `POST /api/funciones` con una película inexistente | `400` — "Se hace referencia a un recurso que no existe" |
| `POST /api/salas` con más de 26 filas | `400` — "Cantidad de filas o butacas inválida" |
| Ruta inexistente | `404` — "Ruta no encontrada" |

---

## 📁 Estructura del proyecto

```text
gestion-cine/
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts            # arma la app Express (middlewares y rutas)
│       ├── server.ts         # conecta la base y levanta el servidor
│       ├── config/           # conexión a PostgreSQL (Sequelize)
│       ├── models/           # Usuario, Película, Sala, Butaca, Función, FuncionButaca,
│       │                     # Producto, Compra, CompraProducto, Entrada
│       ├── routes/           # una ruta por módulo + index
│       ├── controllers/      # lógica de cada endpoint
│       ├── services/         # reglas reutilizables (butacas de sala y de función)
│       ├── middlewares/      # auth (token y rol) y errorHandler
│       └── utils/            # AppError, asyncHandler, jwt, params, validar
│
├── frontend/
│   └── src/                  # React + TypeScript + Vite (implementación depende de la rama)
│
├── docs/
│   └── decisiones-diseno.md  # análisis de diseño del Taller II
│
├── .env.example
├── docker-compose.yml
└── README.md
```

Se incorporaron scripts SQL de migración en el trabajo más reciente del backend; comprobar si están integrados en la rama actual. Quedan por preparar `seeders/`, los `Dockerfile` del backend y frontend, y la organización interna del frontend (`components/`, `pages/`, `services/`, `types/`). Esta estructura podrá ajustarse a medida que evolucione el proyecto, siempre buscando mantener nombres claros, consistencia con el stack elegido y facilidad para encontrar archivos.

---

## 📚 Documentación de diseño

El análisis de diseño y mantenibilidad del Taller II (diagnóstico, alternativas, decisión y trade-offs sobre el código real) está en [`docs/decisiones-diseno.md`](docs/decisiones-diseno.md).

---


---

## ✅ Validaciones locales (Taller III)

Desde la raíz del repositorio, ejecutar por separado:

```powershell
cd backend
npm ci
npm run build

cd ../frontend
npm ci
npm run lint
npm run build
```

Los comandos `build` compilan TypeScript y, en frontend, también generan `dist/`. `lint` valida reglas estáticas del frontend. **No equivale a tener pruebas automatizadas unitarias o de integración**: estas aún deben incorporarse y ejecutarse en un entorno reproducible. Si alguna validación falla, registrar y corregir el resultado en lugar de marcarla como aprobada.

### Casos de prueba propuestos

Regla de negocio: **no permitir funciones superpuestas en una misma sala**. Casos a automatizar: sala libre (aceptar), funciones que se solapan (HTTP 409), funciones consecutivas sin solapamiento (aceptar) y funciones canceladas (no bloquear horario). Las pruebas de reserva simultánea y doble venta requieren además verificar restricciones de base de datos.

---

## 🔀 Trabajo colaborativo y Pull Requests (Taller III)

1. Actualizar la rama de base antes de iniciar una tarea y trabajar en una rama específica (`feature/`, `fix/` o `docs/`).
2. Hacer commits pequeños con mensajes claros, relacionados con una funcionalidad o corrección.
3. Ejecutar localmente las validaciones aplicables antes de subir la rama.
4. Subir la rama a GitHub y abrir un **Pull Request a `dev`**.
5. Describir qué cambió, cómo se probó, riesgos conocidos y capturas si se modificó la interfaz.
6. Solicitar revisión de otro integrante; resolver observaciones y conflictos antes de fusionar.
7. Una vez habilitado, ejecutar en CI las mismas verificaciones de compilación, lint y tests que en local. **No se debe afirmar que existe CI funcional hasta crear y verificar el workflow**.

El código de `feature/frontend-cine` no se considera integrado a otras ramas solo por estar subido al remoto.

---

## ⚠️ Limitaciones conocidas

- En el frontend de pruebas se usa `usuarioId = 1`, precio ficticio por butaca y una URL local fija para la API; no es apto para ventas reales.
- Una compra se crea como `pendiente`; el backend revisado no expone un flujo de confirmación de pago integrado al frontend.
- La reserva de varias butacas se realiza mediante varias solicitudes, no en una transacción única del lado del servidor. Ante fallas parciales, el frontend intenta liberar las reservas creadas, pero puede requerirse revisión manual.
- Las reservas duran 15 minutos y su vencimiento se procesa al ejecutar operaciones que comprueban reservas vencidas.
- No publicar `.env`, secretos, `node_modules` ni datos locales de prueba en entregas o commits.

## 🎯 Objetivo final

Al finalizar el desarrollo se espera contar con una aplicación web funcional que permita:

1. Registrar e iniciar sesión como usuario.
2. Consultar la cartelera.
3. Consultar próximos estrenos.
4. Consultar información de las películas.
5. Consultar funciones disponibles.
6. Seleccionar una función.
7. Visualizar y seleccionar butacas.
8. Comprar entradas.
9. Agregar productos del Candy Bar.
10. Realizar el pago.
11. Generar las entradas correspondientes.
12. Consultar el historial de compras.
13. Administrar películas, salas y funciones.
14. Administrar productos del Candy Bar.
15. Gestionar usuarios y roles.
16. Consultar información y estadísticas de ventas.

---

## 📌 Estado del proyecto

**En desarrollo — backend en construcción.**

La base del backend, el modelo de datos y la cartelera (películas, salas y funciones) ya están implementados. Siguen pendientes la autenticación, el flujo completo de compra con pagos simulados y las pantallas del frontend. Las funcionalidades se incorporarán progresivamente durante el período de desarrollo.