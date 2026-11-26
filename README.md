# 🎬 Sistema de Gestión de Cine

Sistema web para la gestión integral de un cine, permitiendo consultar la cartelera, próximos estrenos, funciones disponibles, selección de butacas, compra de entradas y productos del Candy Bar desde una única plataforma.

El sistema incluye además un panel administrativo para gestionar películas, salas, funciones, butacas, productos y ventas.

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
* **bcrypt** — Generación y comparación de hashes de contraseñas.

### Herramientas

* **Git / GitHub** — Control de versiones y trabajo colaborativo.
* **Docker / Docker Compose** — Hoy levanta la base de datos PostgreSQL (ver [Docker](#-docker)).
* **Postman** — Pruebas manuales de la API REST.
* **Vitest** — Pruebas automatizadas del backend.
* **GitHub Actions** — Verificación automatizada de tests y compilación.

> Esta selección de tecnologías fue definida por el equipo para el Taller 1. Puede ajustarse si durante el desarrollo aparece una necesidad concreta que lo justifique.

---

## 🚀 Instalación y puesta en marcha desde cero

Esta guía está pensada para **Windows 11 con PowerShell y Docker Desktop**. También puede utilizarse en otros sistemas operativos adaptando los comandos de copia de archivos. Los ejemplos asumen que todo se ejecuta en la **misma computadora**.

### 1. Requisitos previos

| Herramienta | Requisito / uso |
| --- | --- |
| Git | Clonar el repositorio |
| Node.js **24 o superior** y npm | Ambos `package.json` declaran `node >=24.0.0` |
| Docker Desktop + Docker Compose | Iniciar PostgreSQL 16 |
| VS Code (opcional) | Editar y explorar el proyecto |
| Navegador | Utilizar el frontend |
| Postman (opcional) | Verificar endpoints HTTP |

Verificar desde PowerShell:

```powershell
node --version
npm --version
git --version
docker --version
docker compose version
```

Antes de continuar, abrir Docker Desktop y esperar a que el motor esté iniciado.

### 2. Clonar el proyecto

Abrir PowerShell en la carpeta donde se quiera guardar el proyecto:

```powershell
git clone https://github.com/FrancoSini/MetodologiaSistemasII.git
cd MetodologiaSistemasII
git switch dev
git pull origin dev
```

**Importante:** el enlace de GitHub se comprobó en la configuración remota del repositorio recibido. Aquí se utiliza `dev` como rama integrada de trabajo; si el equipo decide entregar desde `main` u otra rama, debe actualizar esta indicación después de fusionar los cambios. La documentación se mantiene en la rama integrada `dev`.

```powershell
git branch --show-current
```

### 3. Preparar el archivo de configuración

El repositorio incluye `.env.example` **en la raíz**, mientras que el servidor usa las variables de entorno al arrancar desde `backend/`. Copiarlo desde la raíz:

```powershell
Copy-Item .env.example backend/.env
```

El backend utiliza variables de entorno para configurar la conexión a PostgreSQL, el servidor y la autenticación. Después de copiar el archivo de ejemplo, adaptar `backend/.env` al entorno local sin publicar contraseñas ni claves secretas.

**Importante para ejecutar esta versión:** Docker Compose publica PostgreSQL en el puerto **5433** del equipo (5432 dentro del contenedor), por lo que el puerto de conexión configurado en el backend debe coincidir. El servidor utiliza el puerto **3001** y el frontend de Vite normalmente se inicia en **5173**.

El archivo de ejemplo y el código no utilizan actualmente el mismo nombre para la clave JWT: el código espera `JWT_SECRET_KEY`. Hay que tener en cuenta esa diferencia al configurar el entorno. El código también tiene una clave fija de respaldo si no se define la variable, lo que constituye una limitación de seguridad conocida.

**Por seguridad:** no subir `backend/.env` al repositorio ni compartir credenciales reales. Las contraseñas y configuraciones de PostgreSQL deben ser coherentes entre el backend y Docker Compose.

### 4. Iniciar la base de datos

Desde la raíz `MetodologiaSistemasII/`:

```powershell
docker compose up -d db
docker compose ps
```

Se levanta PostgreSQL 16, con la base `gestion_cine` y un volumen persistente `pgdata`. El servicio se llama `db` y el contenedor `postgres_db`.

Si no conecta, revisar:

```powershell
docker compose logs db
```

### 5. Instalar dependencias del backend

Abrir una terminal nueva en la raíz:

```powershell
cd backend
npm ci
```

`npm ci` instala exactamente lo declarado en el `package-lock.json`, sin modificarlo. Si falla, verificar la versión de Node y que el archivo de bloqueo esté presente.

### 6. Iniciar el backend

Desde `backend/`, con PostgreSQL activo y `backend/.env` configurado:

```powershell
npm run dev
```

El servidor carga el entorno, establece la conexión con PostgreSQL mediante Sequelize y ejecuta `sequelize.sync()` para crear **tablas faltantes**; no aplica automáticamente todas las migraciones SQL del repositorio. Debe verse el mensaje de conexión exitosa y el servidor en `http://localhost:3001`.

En otra terminal PowerShell, comprobar la conexión con API y base de datos:

```powershell
Invoke-RestMethod http://localhost:3001/api/salud
```

**Resultado esperado:** un JSON con `estado: "ok"` y `baseDeDatos: "conectada"`. Si falla esta prueba, resolver la conexión antes de avanzar al frontend.

### 7. Instalar e iniciar el frontend

Abrir otra terminal desde la raíz y mantener el backend ejecutándose:

```powershell
cd frontend
npm ci
npm run dev
```

Abrir en el navegador la URL que indique Vite (usualmente `http://localhost:5173`). La interfaz utiliza la API local en `http://localhost:3001/api`.

Si Vite cambia a `5174`, ajustar `CORS_ORIGIN=http://localhost:5174` en `backend/.env` y **reiniciar el backend**. Si el backend se ejecuta en otro equipo, la URL fija del frontend necesitará adaptarse en el código.

### 8. Verificación rápida de la instalación

| Paso | Qué comprobar |
| --- | --- |
| PostgreSQL | `docker compose ps` muestra el servicio `db` activo |
| Backend | `npm run dev` inicia sin errores de conexión |
| API | `/api/salud` responde `estado: ok` y `baseDeDatos: conectada` |
| Frontend | Vite informa su URL y el navegador abre la interfaz |
| Cartelera | La interfaz consulta la API sin errores de CORS |
| Funcionalidades administrativas | Requieren una cuenta con rol `admin` y datos de prueba; ver el apartado siguiente |

### 9. Datos de prueba y cuenta administradora

**No se encontró un seeder automático ni credenciales de administrador listas para utilizar** en el ZIP revisado. Una base recién creada puede estar vacía, por lo que la cartelera no mostrará películas hasta cargarlas.

El endpoint `POST /api/autenticacion/registro` permite registrar usuarios, pero el código asigna de manera intencional el rol `cliente` (ignora un rol enviado desde el navegador). Para probar el panel de administración se necesita **preparar de forma controlada un usuario `admin`**. No se deben publicar contraseñas ni claves de demostración en el repositorio.

Para una demo local, el equipo puede registrar su propia cuenta y, **solo en la base local de desarrollo y con autorización del equipo**, promoverla desde una herramienta SQL como pgAdmin o `psql`:

```sql
-- Ejecutar únicamente en la base local de pruebas.
-- Sustituir el email por el de la cuenta de prueba creada por el equipo.
UPDATE usuarios
SET rol = 'admin'
WHERE email = 'admin.demo@ejemplo.local';
```

Cerrar sesión e iniciar sesión nuevamente para obtener un JWT con el rol actualizado. El equipo debe verificar previamente que el registro se haya realizado y que la tabla `usuarios` exista. Una vez con permisos, se pueden cargar películas, salas y funciones desde el panel de administración o la API.

**Antes de entregar:** preparar datos demostrables y validar el circuito completo, sin subir una base con datos personales o secretos.

### 10. Migraciones SQL presentes en el repositorio

En `backend/migrations/` hay dos archivos:

- `001_agregar_estado_funciones.sql`: agrega el estado de cancelación de funciones.
- `002_crear_reservas_butacas.sql`: define reservas de butacas y restricciones para reservas activas.

Estas migraciones **no se ejecutan por `npm run dev`**. Son scripts SQL destinados a aplicarse cuando el esquema de la base lo requiera; el orden es `001` y luego `002`, porque presuponen tablas existentes. **No ejecutarlos a ciegas:** primero iniciar el backend, revisar el esquema real y confirmar con el equipo cuáles se aplicaron en esa base. Para una entrega reproducible, registrar ese estado o proporcionar una inicialización automatizada.

### 11. Detener el entorno

Cerrar los procesos `npm run dev` con `Ctrl + C`. Desde la raíz del repositorio:

```powershell
docker compose down
```

Este comando detiene los contenedores sin borrar el volumen con los datos. **No utilizar `docker compose down -v`** salvo que se quiera eliminar la base de datos local.

---

## 🛠️ Problemas habituales de instalación

| Problema | Causa posible | Qué revisar |
| --- | --- | --- |
| `npm ci` falla | Node o lockfile | `node --version`, ejecutar en la carpeta correcta |
| Docker no inicia | Docker Desktop apagado | Abrir Docker Desktop y revisar el motor |
| Puerto 5432 ocupado | PostgreSQL local u otro contenedor | Cambiar mapeo a `5433:5432` y `DB_PORT=5433` |
| `SequelizeConnectionError` | Credenciales o DB incorrectas | `backend/.env`, `docker-compose.yml`, logs del contenedor |
| `/api/salud` no responde | Backend caído o puerto distinto | Revisar salida de `npm run dev`, `PORT=3001` |
| Error de CORS | Puerto del frontend diferente | Ajustar `CORS_ORIGIN` y reiniciar backend |
| Frontend no carga datos | URL fija de API o backend inactivo | Revisar navegador y `http://localhost:3001/api/salud` |
| Respuesta 401/403 en administración | Falta token o rol | Iniciar sesión con cuenta de prueba administradora |
| Cartelera vacía | Base sin datos iniciales | Preparar registros con cuenta admin |

---

## 📌 Estado actual y pendientes conocidos

**Estado actual:** El Sistema de Gestión de Cine se encuentra en desarrollo avanzado. Actualmente cuenta con funcionalidades implementadas en el backend y frontend, incluyendo gestión de películas, salas, funciones, reservas de butacas, autenticación, compras, entradas y Candy Bar.

El proyecto incorpora validaciones de negocio, manejo centralizado de errores, pruebas automatizadas con Vitest y un workflow de GitHub Actions para verificar el backend.

El equipo comprobó localmente el registro, inicio de sesión, cartelera, reserva, compra simulada, emisión de entradas y operaciones de Candy Bar. Estas pruebas manuales no equivalen a cobertura exhaustiva del sistema.

### Funcionalidades implementadas

| Módulo | Estado |
| --- | --- |
| Modelo de datos con Sequelize y PostgreSQL | ✅ Implementado |
| Gestión de películas, salas y funciones | ✅ Implementado |
| Generación de butacas por sala y función | ✅ Implementado |
| Validación de superposición de horarios | ✅ Implementado |
| Manejo centralizado de errores | ✅ Implementado |
| Autenticación con JWT y control de roles | ✅ Implementado |
| Selección y reserva de butacas | ✅ Implementado |
| Compra y emisión de entradas | ✅ Implementado |
| Simulación de pagos (efectivo, débito y crédito) | ✅ Implementado |
| Gestión de productos del Candy Bar | ✅ Implementado |
| Carrito de compras del Candy Bar | ✅ Implementado |
| Descuento de stock al confirmar compras | ✅ Implementado |
| Frontend con React y TypeScript | ✅ Desarrollado |
| Panel de administración | ✅ Implementado |
| Tests automatizados con Vitest | ✅ 22 casos aprobados en la ejecución local |
| GitHub Actions | ✅ Workflow configurado |

### Calidad y pruebas automatizadas

El backend utiliza **Vitest** para verificar comportamientos relevantes del sistema.

Se ejecutaron 22 casos de prueba, distribuidos en tres archivos:

- `superposicionHorarios.test.ts`: 6 pruebas sobre horarios de funciones.
- `productos.test.ts`: 9 pruebas sobre reglas y validaciones de productos.
- `pagoService.test.ts`: 7 pruebas sobre procesamiento de pagos y control de stock, incluidos stock exacto y cantidades repetidas.

Estas pruebas permiten comprobar distintos escenarios, incluyendo operaciones normales, condiciones límite y situaciones de error.

También se configuró un workflow de **GitHub Actions** que automatiza la instalación de dependencias, la ejecución de pruebas y la compilación del backend.

**Resultados observados:** `npm test` finalizó con **22/22 tests aprobados** (3 archivos); `npm run build` del backend finalizó sin errores. También se verificaron `npm run lint` y `npm run build` del frontend, y GitHub Actions mostró verificaciones en verde en Pull Requests. Estas evidencias corresponden a las ejecuciones del equipo; un resultado correcto no implica que todos los escenarios estén cubiertos.

La mejora documentada de `pagoService.ts` eliminó una afirmación no nula (`!`) innecesaria al recorrer las entradas de un `Map`; se preservó la validación y se sumaron los dos tests mencionados. Ver [`docs/Revision_calidad_codigo.md`](docs/Revision_calidad_codigo.md).

### Pendientes conocidos

- [x] Modelar la base de datos con Sequelize y PostgreSQL.
- [x] Definir la estructura del backend y frontend.
- [x] Configurar Express, React, TypeScript y Vite.
- [x] Implementar gestión de películas, salas y funciones.
- [x] Implementar validación de superposición de horarios.
- [x] Implementar autenticación con JWT y roles.
- [x] Implementar selección y reserva de butacas.
- [x] Implementar compra y emisión de entradas.
- [x] Implementar pagos simulados mediante Factory y Strategy.
- [x] Implementar gestión de productos del Candy Bar.
- [x] Implementar carrito y procesamiento de compras.
- [x] Implementar manejo centralizado de errores.
- [x] Incorporar tests automatizados con Vitest.
- [x] Configurar GitHub Actions para el backend.
- [x] Comprobar la ejecución satisfactoria de los tests existentes (22/22).
- [x] Verificar la compilación del backend.
- [x] Documentar los casos de prueba y sus resultados.
- [x] Registrar evidencia de revisión de calidad del código.
- [x] Verificar manualmente los recorridos principales del frontend y backend.
- [ ] Revisar la configuración y protección de variables de entorno.
- [ ] Verificar y actualizar la colección de Postman, si corresponde.
- [ ] Preparar la demostración y defensa final del proyecto.

---

## 📚 Documentación técnica adicional

- [Decisiones de diseño del Taller II](docs/decisiones-diseno.md) — registro histórico de decisiones anteriores.
- [Actualización de decisiones del Taller III](docs/actualizacion-decisiones-tallerIII.md) — evolución del diseño y sus limitaciones.
- [Revisión de calidad del código](docs/Revision_calidad_codigo.md) — refactoring de pagos, casos agregados y verificación.

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

Los errores procesados por el middleware centralizado suelen seguir este formato:

```json
{ "error": { "mensaje": "Sala no encontrada" } }
```

Los errores esperados pueden lanzarse con `AppError` (mensaje y código HTTP), y `errorHandler` los convierte en respuesta. Sin embargo, algunos controladores —por ejemplo, los de autenticación— siguen respondiendo con formatos propios; **no todas las respuestas de error están unificadas**. Códigos que maneja el sistema: `400` (datos o ids inválidos, referencias inexistentes), `404` (recurso o ruta inexistente), `409` (el recurso ya existe) y `500` (error interno).

---

## 👤 Roles de usuario

El sistema contempla dos roles principales.

### Administrador

Podrá:

* Gestionar usuarios.
* Gestionar películas.
* Gestionar próximos estrenos.
* Gestionar salas.
* Gestionar butacas.
* Crear y modificar funciones.
* Gestionar productos del Candy Bar.
* Consultar ventas.(no implementada)
* Consultar estadísticas del cine.(no implementada)

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
