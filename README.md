🎬 Sistema de Gestión de Cine

Sistema web para la gestión integral de un cine, permitiendo consultar la cartelera, próximos estrenos, funciones disponibles, selección de butacas, compra de entradas y productos del Candy Bar desde una única plataforma.

El sistema contará además con un panel administrativo para gestionar películas, salas, funciones, butacas, productos y ventas.

---

## 👥 Integrantes

* Lucía Agüero
* Mateo Barrera
* Joaquín Pignotti
* Franco Sini

---

## 🎯 Objetivo del proyecto

El objetivo es desarrollar una aplicación web que permita administrar y gestionar las operaciones principales de un cine, centralizando tanto la gestión interna como la experiencia de compra de los clientes.

Los clientes podrán consultar las películas disponibles, conocer los próximos estrenos, seleccionar una función, elegir sus butacas, agregar productos del Candy Bar y realizar la compra de sus entradas.

Los administradores podrán gestionar las películas, salas, funciones, butacas, productos y consultar las ventas realizadas.

---

# 🛠️ Tecnologías utilizadas

A definir 

---

# 🏗️ Arquitectura

El sistema seguirá una arquitectura cliente-servidor basada en una API REST.

```text
┌─────────────────────────────────┐
│            FRONTEND             │
│       React + TypeScript        │
│                                 │
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
│             BACKEND             │
│       Node.js + Express         │
│                                 │
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
│           PostgreSQL            │
│                                 │
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

# 👤 Roles de usuario

El sistema contará inicialmente con dos roles principales.

## Administrador

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

## Cliente

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

# 🎥 Funcionalidades principales

## Gestión de usuarios

* Registro de usuarios.
* Inicio de sesión.
* Autenticación mediante JWT.
* Gestión de perfiles.
* Roles y permisos.
* Control de acceso.

## Gestión de películas

El sistema permitirá:

* Crear películas.
* Editar películas.
* Eliminar películas.
* Consultar películas.
* Agregar información de la película.
* Agregar género.
* Agregar duración.
* Agregar clasificación.
* Agregar sinopsis.
* Agregar imagen/poster.
* Agregar trailer.
* Marcar películas como próximas a estrenar.

## Cartelera

Los clientes podrán consultar:

* Películas actualmente disponibles.
* Información de cada película.
* Funciones disponibles.
* Horarios.
* Salas.

## Próximos estrenos

El sistema permitirá visualizar:

* Películas próximas a estrenarse.
* Fecha de estreno.
* Información de la película.
* Trailer.
* Género.
* Sinopsis.

## Gestión de salas

El administrador podrá:

* Crear salas.
* Modificar salas.
* Eliminar salas.
* Configurar la cantidad de butacas.
* Consultar la distribución de las butacas.

## Gestión de funciones

El administrador podrá:

* Crear funciones.
* Modificar funciones.
* Eliminar funciones.
* Asociar una película a una función.
* Asociar una sala.
* Definir fecha.
* Definir horario.
* Consultar funciones disponibles.

## Selección de butacas

El cliente podrá:

1. Seleccionar una película.
2. Seleccionar una función.
3. Visualizar la distribución de la sala.
4. Consultar las butacas disponibles.
5. Seleccionar una o más butacas.
6. Continuar con la compra.

El sistema deberá evitar que una misma butaca sea vendida para la misma función a más de un cliente.

## 🎟️ Compra de entradas

El usuario podrá:

* Seleccionar una función.
* Seleccionar sus butacas.
* Revisar el resumen de compra.
* Confirmar la compra.
* Realizar el pago.
* Obtener sus entradas.

## 🍿 Candy Bar

El sistema permitirá gestionar productos como:

* Pochoclos.
* Gaseosas.
* Agua.
* Golosinas.
* Combos.

El administrador podrá:

* Crear productos.
* Modificar productos.
* Eliminar productos.
* Modificar precios.
* Gestionar stock.

El cliente podrá:

* Consultar productos.
* Seleccionar productos.
* Definir cantidades.
* Agregarlos a su compra.

## 💳 Pagos

Simular ?¿¿


## 🎫 Entradas

Luego de realizar una compra, el sistema generará una entrada asociada a:

* Película.
* Función.
* Sala.
* Butaca.
* Usuario.
* Fecha de compra.
* Código de entrada.

---

# 🔄 Flujo principal de compra

El flujo principal del sistema será:

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

# 🌐 API REST

El backend expondrá una API REST para la comunicación entre el frontend y el servidor.

## Autenticación

```text
POST   /api/autenticacion/registro
POST   /api/autenticacion/login
```

## Películas

```text
GET    /api/peliculas
GET    /api/peliculas/:id
POST   /api/peliculas
PUT    /api/peliculas/:id
DELETE /api/peliculas/:id
```

## Salas

```text
GET    /api/salas
GET    /api/salas/:id
POST   /api/salas
PUT    /api/salas/:id
DELETE /api/salas/:id
```

## Funciones

```text
GET    /api/funciones
GET    /api/funciones/:id
POST   /api/funciones
PUT    /api/funciones/:id
DELETE /api/funciones/:id
```

## Butacas

```text
GET    /api/funciones/:id/butacas
POST   /api/funciones/:id/butacas
```

## Productos / Candy Bar

```text
GET    /api/productos
GET    /api/productos/:id
POST   /api/productos
PUT    /api/productos/:id
DELETE /api/productos/:id
```

## Compras

```text
GET    /api/compras
GET    /api/compras/:id
POST   /api/compras
```

## Entradas

```text
GET    /api/entradas
GET    /api/entradas/:id
```

Los endpoints podrán modificarse a medida que avance el desarrollo.

---

# 🐳 Docker

Docker será utilizado para facilitar la configuración y ejecución del entorno de desarrollo.
Docker Compose permitirá levantar los servicios necesarios utilizando una configuración común para todos los integrantes del proyecto.

---

# 🧪 Pruebas

Se utilizará **Postman** para realizar pruebas sobre la API REST.

Se comprobarán:

* Respuestas HTTP.
* Registro de usuarios.
* Autenticación.
* Creación de recursos.
* Actualización de recursos.
* Eliminación de recursos.
* Validaciones.
* Manejo de errores.
* Autorización según roles.
* Relaciones entre entidades.
* Disponibilidad de butacas.
* Registro de compras.

---

# 📁 Estructura aproximada del proyecto

a definir

La estructura podrá modificarse a medida que evolucione el proyecto.

---

# 🎯 Objetivo final

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

# 📌 Estado del proyecto

**En desarrollo**

El proyecto se encuentra en etapa inicial. Las funcionalidades serán incorporadas progresivamente durante el período de desarrollo.

