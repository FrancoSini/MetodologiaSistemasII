# Decisiones de diseño — Taller II

Metodología de Sistemas II · Sistema de Gestión de Cine · Backend (Node.js, Express 5, TypeScript, Sequelize)

# Análisis  — Manejo de errores en el backend ((Clean Code / Principio DRY))

## 1. Código analizado

| Qué | Dónde |
| --- | --- |
| Manejo central de errores | `backend/src/middlewares/errorHandler.ts` (`notFound` L6-8, `errorHandler` L12-41) |
| Error esperado de la aplicación | `backend/src/utils/AppError.ts` (L4-12) |
| Envoltorio de controllers async | `backend/src/utils/asyncHandler.ts` (L6-10) |
| Controllers con `try/catch` propio | `controllers/sala.controller.ts`, `funcion.controller.ts`, `pelicula.controller.ts` |
| Controllers que lanzan `AppError` | `controllers/compras.controller.ts`, `entradas.controller.ts`, `productos.controller.ts` |
| Servicio que lanzaba un error genérico | `services/salaService.ts` → `crearButacasDeSala` (L17-35) |
| Utilidad agregada | `utils/params.ts` → `obtenerId` (L1-13) |

El proyecto ya tiene una decisión de base: `AppError` representa un error esperado (mensaje + código HTTP) y el `errorHandler` es el único lugar que lo convierte en respuesta.

```ts
// backend/src/utils/AppError.ts (L4-12)
export class AppError extends Error {
    public readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "AppError";
        this.status = status;
    }
}
```

```ts
// backend/src/middlewares/errorHandler.ts (L12-15)
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { mensaje: err.message } });
  }
```
Al implementar un middleware centralizado de errores y delegar las excepciones a través de una clase de error personalizada (`AppError`), eliminamos la redundancia de bloques `try/catch` repetidos en cada endpoint. Esto respeta el principio DRY (Don't Repeat Yourself), reduciendo el ruido visual en los controladores y garantizando que las respuestas de error hacia el cliente mantengan una estructura uniforme en toda la aplicación. 
## 2. Diagnóstico

Detectamos dos problemas.

**a) Tres estilos distintos de manejar errores.** Convivían:

1. `try/catch` con `next(error)` y un 404 armado a mano (sala, función, película):

```ts
// backend/src/controllers/sala.controller.ts (L18-32)
export async function getSalaById(req: Request, res: Response, next: NextFunction) {
    try {
        const sala = await Sala.findByPk(obtenerId(req.params.id), {
        include: [{ model: Butaca }],
        });

        if (!sala) {
        return res.status(404).json({ error: { mensaje: "Sala no encontrada" } });
        }

        return res.json(sala);
    } catch (error) {
        next(error);
    }
}
```

2. Lanza `AppError` y dejar que el `errorHandler` responda (compras, entradas, productos):

```ts
// backend/src/controllers/productos.controller.ts (L44)
throw new AppError("Los datos del producto son inválidos", 400);
```

3. Respuestas con otro formato, `{ ok, msg }`, en el controller de autenticación.

**b) Cinco casos devolvían 500 cuando el error era del cliente.** Antes del arreglo:

```ts
// getSalaById, getPeliculaById y getFuncionById: el id llegaba como string a la base
const { id } = req.params;
const sala = await Sala.findByPk(id as string, { ... });
```

```ts
// salaService.ts: un Error genérico terminaba en el 500 del errorHandler
throw new Error("Cantidad de filas o butacas inválida");
```

Y al crear una función con una película o sala inexistente, el error de clave foránea no tenía tratamiento.

Conceptos aplicados (Clases 5 y 7): **duplicación y fuente de verdad** (cómo se responde un error debería vivir en un solo lugar), **Shotgun Surgery** (cambiar el formato de error obliga a tocar muchos archivos), **SRP** y **Extract Method** (la validación del id).

## 3. Alternativas consideradas

| Alternativa | Evaluación |
| --- | --- |
| **A. Arreglar solo los 500 con cambios mínimos** | Corrige el defecto tocando pocos archivos y sin cambiar la estructura de los controllers. **Elegida.** |
| **B. Unificar los tres estilos** (sacar todos los `try/catch`, `AppError` en autenticación, `asyncHandler` en todas las rutas) | Es la mejor solución a largo plazo, pero toca unos 17 archivos que el equipo sigue modificando y no hay tests automáticos que detecten regresiones. **Se posterga.** |
| **C. Centralizar también las claves foráneas y borrar el `catch` de `compras`** | Se perderían mensajes específicos ("El usuario indicado no existe"). Solo se agregó una red de seguridad genérica en el `errorHandler`. |

## 4. Decisión

Elegimos la alternativa **A**.

**1. Extract Method:** la validación del id pasa a una función con nombre.

```ts
// backend/src/utils/params.ts (L1-13)
import { AppError } from "./AppError";

// Convierte un parámetro de ruta (/:id, siempre llega como string) en un ID válido.
// Si no lo es, corta con 400 en vez de mandar "abc" a la base de datos.
export function obtenerId(valor: unknown): number {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("El ID debe ser un número entero positivo", 400);
  }

  return id;
}
```

Se usa en `getSalaById`, `getPeliculaById` y `getFuncionById`: `Sala.findByPk(obtenerId(req.params.id), ...)` 

**2. Error esperado en el servicio:** `AppError` 400 en lugar de `Error`.

```ts
// backend/src/services/salaService.ts (L23-25)
if (filas < 1 || filas > 26 || butacasPorFila < 1) {
  throw new AppError("Cantidad de filas o butacas inválida", 400);
}
```

**3. Red de seguridad en el `errorHandler`** para claves foráneas inexistentes:

```ts
// backend/src/middlewares/errorHandler.ts (L23-26)
// Se referencia algo que no existe (ej: película o sala inexistente al crear una función)
if (err instanceof ForeignKeyConstraintError) {
  return res.status(400).json({ error: { mensaje: "Se hace referencia a un recurso que no existe" } });
}
```

**Decidimos mantener**,  como deuda registrada:

- Los `try/catch` con `next(error)` de sala, función y película, incluido el manejo manual de transacciones:

```ts
// backend/src/controllers/sala.controller.ts (L35-57, resumido)
export async function createSala(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    try {
        // ... crea la sala y sus butacas dentro de la transacción ...
        await t.commit();
        return res.status(201).json(nuevaSala);
    } catch (error) {
        await t.rollback();
        next(error);
    }
}
```

- El `catch` específico de claves foráneas de `compras`, por su mensaje propio:

```ts
// backend/src/controllers/compras.controller.ts (L57-63)
} catch (error: any) {
  if (error.name === "SequelizeForeignKeyConstraintError") {
    throw new AppError("El usuario indicado no existe", 400);
  }

  throw error;
}
```
 Separación de Responsabilidades (Principio de SOLID) 

En lugar de validar el tipo y formato de los datos (`typeof`, cadenas vacías, rangos) dentro de cada controlador, extraemos esa lógica a un middleware dedicado exclusivamente a esa tarea (`middlewares/validarProducto.ts`) que se intercala en la canalización de la ruta (`routes/productoRoutes.ts`).

Esta refactorización logra un diseño mantenible y desacoplado:
Principio de Responsabilidad Única (SRP): El controlador conserva una única razón de cambio (la coordinación del flujo HTTP), mientras que el middleware asume la responsabilidad exclusiva de verificar el contrato de entrada.
Evolución sin impacto directo: Si las reglas del negocio cambian en el futuro (por ejemplo, si los productos del candybar comienzan a requerir fecha de vencimiento o un esquema de campos diferente), la modificación se encapsula en la capa de validación sin necesidad de tocar ni arriesgar la lógica del controlador.


## 5. Evidencia y trade-offs

**Evidencia.**  archivos modificados: `errorHandler.ts`, `salaService.ts`, `sala.controller.ts`, `pelicula.controller.ts`, `funcion.controller.ts` y el nuevo `utils/params.ts`. Casos que cambian, reproducibles en Postman:

| Pedido | Antes | Después |
| --- | --- | --- |
| `GET /api/salas/abc` (igual en `/api/peliculas/abc` y `/api/funciones/abc`) | 500 | **400** "El ID debe ser un número entero positivo" |
| `POST /api/funciones` con `peliculaId` inexistente | 500 | **400** "Se hace referencia a un recurso que no existe" |
| `POST /api/salas` con `filas: 30` | 500 | **400** "Cantidad de filas o butacas inválida" |
| `GET /api/salas/99`, datos inválidos, ruta inexistente, JSON roto, creaciones correctas | sin cambios | sin cambios |

**Beneficios.** Los errores del cliente dejan de aparecer como fallas del servidor; la validación del id vive en un solo lugar; el cambio es chico y fácil de revisar y revertir; no se tocó lo que ya funcionaba.

**Costos y riesgos.**

- Los tres estilos de manejo de errores **siguen existiendo**: un controller nuevo puede volver a elegir cualquiera. Es deuda consciente, con la alternativa B como siguiente paso.
- No es un refactoring puro: extraer `obtenerId` es refactoring, pero pasar de 500 a 400 cambia el comportamiento observable. Es una corrección de defectos.
- `salaService` ahora conoce `AppError`, que lleva un código HTTP: acopla un poco el servicio a la capa web. Es aceptable con este tamaño.


**Deuda registrada, fuera de este cambio.** Las rutas de autenticación no están montadas; `validarToken` y `validarAdmin` no se aplican a ninguna ruta; `registrarUsuario` acepta `rol` desde el body y su valor por defecto es `"Cliente"` (el tipo es `"cliente"`); `.env.example` define `JWT_SECRET` pero el código lee `JWT_SECRET_KEY`.

# Análisis  — Validación de datos en `crearProducto`

## 1. Código analizado

`backend/src/controllers/productos.controller.ts` → `crearProducto` (L30-55) y `backend/src/routes/productos.routes.ts`.

## 2. Diagnóstico

El controller valida el formato de los datos de entrada y además coordina el pedido. Son dos responsabilidades en la misma función:

```ts
// backend/src/controllers/productos.controller.ts (L30-45)
export const crearProducto = async (req: Request, res: Response) => {
  const { nombre, precio, stock, categoria } = req.body;

  if (
    typeof nombre !== "string" ||
    nombre.trim() === "" ||
    typeof categoria !== "string" ||
    categoria.trim() === "" ||
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    throw new AppError("Los datos del producto son inválidos", 400);
  }
```

Concepto: **SRP** (el controller cambiaría si cambian las reglas de validación). Señal a vigilar: la condición larga se vuelve difícil de leer si se agregan campos.

## 3. Alternativas

| Alternativa | Evaluación |
| --- | --- |
| **A. Mantener la validación en el controller** | Es simple, legible y está en un solo endpoint. **Elegida por ahora.** |
| **C. Usar `express-validator`**, que ya está en `package.json` junto con `validarCampos` (`utils/validar.ts`) | Estandariza la validación, pero ese helper responde con otro formato (`{ ok, errores }`) que no pasa por el `errorHandler`. Habría que adaptarlo. |

## 4. Decisión

**Mantener** la validación en el controller (A). Hoy hay un solo endpoint que valida productos y la regla cabe en una condición legible; extraerla no reduce el costo actual. Se reevalúa si aparece un segundo endpoint con validación similar (por ejemplo `PUT`) o si se agregan campos (fecha de vencimiento, por ejemplo): en ese caso pasaría a un middleware (B), lanzando `AppError` para que el `errorHandler` siga siendo la única fuente del formato de error.

## 5. Evidencia y trade-offs

- **Evidencia:** `controllers/productos.controller.ts` L30-55, `routes/productos.routes.ts`, `utils/validar.ts` (usa otro formato de error) y la dependencia `express-validator` en `package.json`.
- **Beneficio de mantener:** cero cambios ; el código se lee de arriba abajo.
- **Costo:** el controller mezcla validación y coordinación; si las reglas crecen, la condición se vuelve difícil de mantener.

# Patrones evaluados y no implementados

Todavía no hay compra con pagos reales, así que **no hay patrones implementados de forma explícita en el código**. Estos fueron los evaluados para esa parte:

| Patrón | Cuándo se justificaría |
| --- | --- |
| **Strategy** (un procesador por medio de pago) | Si débito, crédito y efectivo tienen reglas distintas (cuotas, recargo, validación de tarjeta). Si hacen lo mismo, alcanza un `switch` o un mapa. |
| **Factory** (elegir el procesador según `medioPago`) | Junto con Strategy, para que el servicio de compra no conozca cada clase concreta. |
| **Adapter** (interfaz propia hacia una pasarela de pago) | Recién cuando se integre un proveedor externo real (por ejemplo Mercado Pago); con pagos simulados no hay interfaz incompatible que traducir. |
| **Facade** (un servicio que coordina la compra completa) | Para coordinar disponibilidad de butacas, total, pago y creación de entradas; debe ser delgada o se convierte en una "God Facade". |
| **Builder** | No hay hoy un objeto con muchos parámetros opcionales que lo justifique. Descartado. |
# Ejemplos (Posible a tener en cuenta): 
## PATRON ADAPTER

Cuando incorporemos la funcionalidad de pago en nuestro sistema, para cobrar las entradas o los productos del candybar, la app tendra que conectarse con un proveedor externo (mercado pago, o un banco determinado). Esos servicios externos son codigos de terceros que hablan su propio "idioma". Si conectamos nuestro controlador o servicio directamente a alguna de esas plataformas, nuestro codigo queda atado a esas reglas, por lo cual si el dia de mañana ellos cambian su api o queremos cambiar de proveedor tenemos que modificar todo nuestro sistema.
Lo que debriamos crear es un ADAPTER, nuestra app siempre se conecta a una interfaz propia y el adapter se encarga de traducir esa llamada al idioma que exige la libreria externa de la otra plataforma.

EJEMPLO: 
```markdown
// interfaces/PaymentGateway.ts

export interface ResultadoPago{
exitoso: boolean;
transaccionId: string;
mensaje: string; }

export interface PaymentGateway {
// Nuestro sistema siempre hablará en montos decimales (ej: $1500.50) y con nuestro ID de orden
pagar(monto: number, emailCliente: string, ordenId: string):
Promise <ResultadoPago>;
}
```

## PATRON STRATEGY

Cuando el cliente llega a la pantalla de finalizar el pago, puede elegir distintos metodos para realizarlo (tarjeta de credito, tarjeta de debito, efectivo en caja, etc). Si ponemos todo ese codigo en un solo lugar nos va a quedar un bloque gigante de IF / SWITCH dificil de mantener y probar. 
La solucion es conevertir cada forma de pago en una estrategia independiente (una clase separada por cada medio de pago). La app simplemente toma la estrategia que eligio el usuario y ejecuta el pago sin importar cual sea. 

EJEMPLO:

```markdown
// estrategias/PagoTarjetaCredito.ts

import { EstrategiaPago, ResultadoPago } from "./EstrategiaPago";
export class PagoTarjetaCredito implements EstrategiaPago {
 constructor(private numeroTarjeta: string, private cuotas: number) {}

 public async pagar(monto: number): Promise
  console.log(\`[Tarjeta Crédito] Procesando $${monto} en ${this.cuotas}
  cuota(s) con tarjeta ****${this.numeroTarjeta.slice(-4)}\`);
  return { exitoso: true, mensaje: "Pago con tarjeta de crédito aprobado" };
 }
}
```
## PATRON BUILDER

Cuando queremos construir la reserva de una entrada o un combo personalizado se requieren configurar muchos parámetros opcionales y validarlos. Un constructor tradicional con 8 parámetros por ejemplo se vuelve difícil de leer. 
La solución es crear un RESERVABUILDER que construye el objeto paso a paso mediante llamadas explicitas:

EJEMPLO: 
```markdown
const reserva = new ReservaBuilder()
 .paraPelicula(101) 
 .enHorario("18:30hs") 
 .conAsientos(["A1", "A2"]) 
 .enFormato("3D") 
 .conAnteojos3D(true) 
 .agregarComboCandybar("Combo Pareja") 
 .aplicarDescuento("Miércoles 2x1") 
 .build();

```

## PATRON FACADE 

Para realizar una operación compleja (como confirmar la compra de una entrada de cine junto a productos del Candybar), el cliente tendría que conocer e invocar múltiples clases en una secuencia técnica rígida: verificar asientos, descontar stock de pochoclos, procesar el pago, generar el ticket QR y enviar notificaciones. La solucion seria crear una fachada (`CheckoutFacade`) que exponga un unico metodo sencillo de alto nivel. La fachada recibe la peticion y coordina por dentro la llamada a estos servicios internos. 

EJEMPLO:
```markdown
// facade/CheckoutFacade.ts
export class CheckoutFacade {
 private asientos = new AsientoService();
 private candybar = new CandybarStockService();
 private pago = new PagoService();
 private qr = new TicketQRService();

// Expone una única operación
public async realizarCompraCine(datos: {
 asientos: string[];
 productosCandybar: string[];
 monto: number;
 ordenId: string;
}) {
 this.asientos.reservar(datos.asientos);
 this.candybar.descontar(datos.productosCandybar);
 this.pago.cobrar(datos.monto);
 this.qr.generar(datos.ordenId);

 return { exito: true, mensaje: "Compra procesada de punta a punta" };
} }
```










