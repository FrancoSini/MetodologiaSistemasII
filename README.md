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
* **React** — Librería para la construcción de la interfaz.
* **TypeScript** — Tipado estático para el código del cliente.

### Backend
* **Node.js** — Entorno de ejecución del servidor.
* **Express.js** — Framework para el desarrollo de la API REST.

### Base de datos
* **PostgreSQL** — Sistema gestor de base de datos.
* **Sequelize** — ORM para la comunicación entre Node.js y PostgreSQL.

### Herramientas
* **Git / GitHub** — Control de versiones y trabajo colaborativo.
* **Docker / Docker Compose** — Contenerización y entorno de desarrollo común para todo el equipo.
* **Postman** — Pruebas sobre la API REST.
* **JWT** — Autenticación de usuarios.

> Esta selección de tecnologías fue definida por el equipo para el Taller 1. Puede ajustarse si durante el desarrollo aparece una necesidad concreta que lo justifique.

---

## 📦 Cómo instalar dependencias

El proyecto todavía no tiene código implementado (ver [Estado actual](#-estado-actual-y-pendientes-conocidos)), por lo que estos pasos describen **cómo se instalará** una vez que arranque el desarrollo del backend y el frontend:

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

También se va a proveer un archivo `.env.example` con las variables de entorno necesarias (conexión a PostgreSQL, secreto de JWT, puertos, etc.), que cada integrante deberá copiar como `.env` y completar con sus propios valores locales.

---

## ▶️ Cómo ejecutar el proyecto

**Opción con Docker (forma prevista para el entorno de desarrollo):**

```bash
docker-compose up --build
```

Esto debería levantar en un futuro los contenedores de backend, frontend y PostgreSQL con una configuración común para todo el equipo.

**Opción manual (mientras no esté armado el Docker Compose):**

```bash
# Backend
cd backend
npm run dev

# Frontend (en otra terminal)
cd frontend
npm start
```

> ⚠️ Por ahora estos comandos son la guía planeada de ejecución. Todavía no hay `package.json`, `docker-compose.yml` ni código funcional en el repositorio, así que no pueden ejecutarse aún tal cual.

---

## 📌 Estado actual y pendientes conocidos

**Estado actual:** el proyecto está en etapa de planificación. Se creó el repositorio y este README inicial, pero **todavía no se escribió código** (ni backend ni frontend).

**Pendientes conocidos:**

* [ ] Definir y bocetar el diseño de las pantallas principales (cartelera, selección de butacas, checkout).
* [ ] Modelar la base de datos (usuarios, películas, salas, funciones, butacas, compras, entradas, productos).
* [ ] Definir la estructura final de carpetas del backend y frontend.
* [ ] Configurar el proyecto base de backend (Express + Sequelize) y frontend (React + TypeScript).
* [ ] Armar el `docker-compose.yml` con los servicios (backend, frontend, PostgreSQL).
* [ ] Implementar la simulación del módulo de pagos (débito, crédito, efectivo).
* [ ] Implementar autenticación (registro/login con JWT).
* [ ] Implementar los módulos de películas, funciones, salas y butacas.
* [ ] Implementar selección de butacas evitando doble venta para la misma función.
* [ ] Implementar Candy Bar y flujo de compra completo.
* [ ] Armar colección de Postman para pruebas de la API.

---

## 🏗️ Arquitectura

El sistema seguirá una arquitectura cliente-servidor basada en una API REST.

```text
┌─────────────────────────────────┐
│            FRONTEND             │
│       React + TypeScript        │
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
│       Node.js + Express          │
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

## 🌐 API REST (propuesta inicial)

El backend expondrá una API REST para la comunicación entre el frontend y el servidor. Estos endpoints son una propuesta inicial y podrán modificarse a medida que avance el desarrollo.

### Autenticación
```text
POST   /api/autenticacion/registro
POST   /api/autenticacion/login
```

### Películas
```text
GET    /api/peliculas
GET    /api/peliculas/:id
POST   /api/peliculas
PUT    /api/peliculas/:id
DELETE /api/peliculas/:id
```

### Salas
```text
GET    /api/salas
GET    /api/salas/:id
POST   /api/salas
PUT    /api/salas/:id
DELETE /api/salas/:id
```

### Funciones
```text
GET    /api/funciones
GET    /api/funciones/:id
POST   /api/funciones
PUT    /api/funciones/:id
DELETE /api/funciones/:id
```

### Butacas
```text
GET    /api/funciones/:id/butacas
POST   /api/funciones/:id/butacas
```

### Productos / Candy Bar
```text
GET    /api/productos
GET    /api/productos/:id
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id
```

### Compras
```text
GET    /api/compras
GET    /api/compras/:id
POST   /api/compras
```

### Entradas
```text
GET    /api/entradas
GET    /api/entradas/:id
```

---

## 🐳 Docker

Docker será utilizado para facilitar la configuración y ejecución del entorno de desarrollo. Docker Compose permitirá levantar los servicios necesarios (backend, frontend y PostgreSQL) utilizando una configuración común para todos los integrantes del proyecto. Todavía no está implementado.

---

## 🧪 Pruebas

Se utilizará **Postman** para realizar pruebas sobre la API REST, comprobando respuestas HTTP, registro de usuarios, autenticación, creación/actualización/eliminación de recursos, validaciones, manejo de errores, autorización según roles, relaciones entre entidades, disponibilidad de butacas y registro de compras.

---

## 📁 Estructura propuesta del proyecto

Todavía no existe código, por lo que esta es la organización de carpetas que el equipo planea seguir, coherente con el stack elegido (Node/Express en el backend, React/TypeScript en el frontend):

```text
gestion-cine/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── migrations/
│   ├── seeders/
│   └── app.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── public/
│
├── docker/
│
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

Esta estructura podrá ajustarse a medida que evolucione el proyecto, siempre buscando mantener nombres claros, consistencia con el stack elegido y facilidad para encontrar archivos.

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

**En desarrollo — etapa inicial (planificación).**

Se creó el repositorio y este README. Las funcionalidades, el código y la estructura definitiva se incorporarán progresivamente durante el período de desarrollo.
