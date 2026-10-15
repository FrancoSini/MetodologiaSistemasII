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
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

El repositorio incluye un archivo `.env.example` con las variables de entorno necesarias (puerto, conexión a PostgreSQL, secreto de JWT, origen permitido para CORS, etc.). Cada integrante debe copiarlo como `.env` y completar sus valores locales. El backend lee el `.env` de la carpeta desde la que se ejecuta, por lo que conviene dejarlo en `backend/`:

```bash
cp .env.example backend/.env
```

Los datos de conexión a la base (`DB_NAME`, `DB_USER`, `DB_PASSWORD`) tienen que coincidir con los de `docker-compose.yml`. Además hay que definir `JWT_SECRET`.

---

## ▶️ Cómo ejecutar el proyecto

**1. Base de datos (PostgreSQL con Docker):**

```bash
docker-compose up -d db
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

**3. Frontend** (en otra terminal, en `http://localhost:5173`):

```bash
cd frontend
npm run dev
```

> ⚠️ El frontend todavía muestra la plantilla inicial de Vite: las pantallas de la aplicación están pendientes.

---

## 📌 Estado actual y pendientes conocidos

**Estado actual:** el backend está en desarrollo y ya es funcional para la cartelera. El frontend tiene solo la plantilla inicial.

| Módulo | Estado |
| --- | --- |
| Modelo de datos (10 modelos) | ✅ Implementado |
| Películas, salas y funciones | ✅ Implementado (consulta y alta) |
| Generación de butacas (por sala y por función) | ✅ Implementado |
| Manejo central de errores | ✅ Implementado |
| Productos, compras y entradas | 🟡 Controllers y rutas básicos; falta el flujo completo |
| Autenticación (registro/login con JWT) | 🟡 Controller y middlewares hechos; las rutas todavía no están montadas |
| Pagos simulados | ⏳ Pendiente (el medio de pago se registra en la compra, sin procesamiento) |
| Selección de butacas sin doble venta | ⏳ Pendiente (el modelo ya lo respalda, falta la lógica de compra) |
| Frontend | ⏳ Plantilla inicial de Vite |

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
* [ ] Exponer las butacas de cada función (`GET /api/funciones/:id/butacas`).
* [ ] Implementar selección de butacas evitando doble venta para la misma función.
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

Docker facilita la configuración del entorno de desarrollo. Hoy el archivo `docker-compose.yml` levanta **solo la base de datos** (PostgreSQL 16, base `gestion_cine`, puerto 5432, con un volumen para conservar los datos):

```bash
docker-compose up -d db
```

Todavía no hay contenedores para el backend ni para el frontend: se ejecutan de forma manual con `npm run dev`. Completar el `docker-compose.yml` con ambos servicios es un pendiente.

---

## 🧪 Pruebas

Se utilizará **Postman** para realizar pruebas sobre la API REST, comprobando respuestas HTTP, registro de usuarios, autenticación, creación/actualización/eliminación de recursos, validaciones, manejo de errores, autorización según roles, relaciones entre entidades, disponibilidad de butacas y registro de compras.

Por ahora las pruebas son **manuales** (todavía no hay colección de Postman ni tests automáticos). Algunos casos que se verifican a mano:

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
│   └── src/                  # React + TypeScript + Vite (plantilla inicial)
│
├── docs/
│   └── decisiones-diseno.md  # análisis de diseño del Taller II
│
├── .env.example
├── docker-compose.yml
└── README.md
```

Quedan por incorporar `migrations/`, `seeders/`, los `Dockerfile` del backend y frontend, y la organización interna del frontend (`components/`, `pages/`, `services/`, `types/`). Esta estructura podrá ajustarse a medida que evolucione el proyecto, siempre buscando mantener nombres claros, consistencia con el stack elegido y facilidad para encontrar archivos.

---

## 📚 Documentación de diseño

El análisis de diseño y mantenibilidad del Taller II (diagnóstico, alternativas, decisión y trade-offs sobre el código real) está en [`docs/decisiones-diseno.md`](docs/decisiones-diseno.md).

---

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