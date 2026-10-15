PATRONES / REFACTORING - CLEAN CODE: IMPLEMENTADO


1) Centralización del Manejo de Errores (Clean Code / Principio DRY)

Al implementar un middleware centralizado de errores y delegar las excepciones a través de una clase de error personalizada (`AppError`), eliminamos la redundancia de bloques `try/catch` repetidos en cada endpoint. Esto respeta el principio DRY (Don't Repeat Yourself), reduciendo el ruido visual en los controladores y garantizando que las respuestas de error hacia el cliente mantengan una estructura uniforme en toda la aplicación.

EJEMPLO:
```markdown
Manejo central de errores:  `backend/src/middlewares/errorHandler.ts` (`notFound`, `errorHandler`) 
Error esperado de la aplicación:  `backend/src/utils/AppError.ts` 
```


2)  Separación de Responsabilidades (Principio de SOLID) 

En lugar de validar el tipo y formato de los datos (`typeof`, cadenas vacías, rangos) dentro de cada controlador, extraemos esa lógica a un middleware dedicado exclusivamente a esa tarea (`middlewares/validarProducto.ts`) que se intercala en la canalización de la ruta (`routes/productoRoutes.ts`).

Esta refactorización logra un diseño mantenible y desacoplado:
Principio de Responsabilidad Única (SRP): El controlador conserva una única razón de cambio (la coordinación del flujo HTTP), mientras que el middleware asume la responsabilidad exclusiva de verificar el contrato de entrada.
Evolución sin impacto directo: Si las reglas del negocio cambian en el futuro (por ejemplo, si los productos del candybar comienzan a requerir fecha de vencimiento o un esquema de campos diferente), la modificación se encapsula en la capa de validación sin necesidad de tocar ni arriesgar la lógica del controlador.

EJEMPLO:
```markdown
//controllers/productos.controller.ts (extracto)

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
```markdown
// middlewares/validarProducto.ts

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
export const validarCrearProducto = (
	req: Request,
	res: Response,
	next: NextFunction
) =>{
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
 stock < 0 ) {
	throw new AppError("Los datos del producto son inválidos", 400); }
next(); 
```


PATRONES A UTILIZAR EN UN FUTURO: 


PATRON ADAPTER

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

PATRON STRATEGY

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
PATRON BUILDER

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

PATRON FACADE 

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










