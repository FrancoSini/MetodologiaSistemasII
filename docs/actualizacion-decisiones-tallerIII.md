# Actualización de decisiones de diseño — Taller III

**Documento complementario de:** [`decisiones-diseno.md`](decisiones-diseno.md)  


> **Alcance:** este documento registra cómo evolucionaron las decisiones descritas en el Taller II. No reemplaza el análisis original ni implica que se hayan eliminado todos los problemas identificados. Las observaciones se basan en el código revisado; las verificaciones de ejecución citadas corresponden a las pruebas realizadas por el equipo durante la preparación del Taller III.

## 1. ¿Por qué agregamos este documento?

En `docs/decisiones-diseno.md` dejamos registrado el diagnóstico y las alternativas que evaluamos en el Taller II. Desde entonces agregamos funcionalidades, reorganizamos controladores y servicios, incorporamos validaciones, pagos simulados y pruebas automáticas.

Para no borrar la historia de las decisiones, mantenemos aquel documento y explicamos aquí **qué cambió, qué sigue pendiente y cómo lo verificamos**. Este registro es útil para una revisión de calidad: permite relacionar una decisión con archivos reales del repositorio, resultados y limitaciones.

## 2. Evolución del manejo de errores (`try/catch`)

### 2.1. Problema original

En el Taller II observamos diferentes maneras de responder errores: algunos controladores capturaban excepciones con `try/catch`, otros lanzaban `AppError` y autenticación respondía con el formato `{ ok, msg }`. También había validaciones que devolvían errores `500` cuando correspondía un error de cliente.

### 2.2. Estado actual del código

| Componente | Situación observada |
| --- | --- |
| `backend/src/utils/AppError.ts` | Representa errores esperados con mensaje y estado HTTP. |
| `backend/src/middlewares/errorHandler.ts` | Centraliza las respuestas de errores que le llegan, incluidos errores de validación y restricciones de Sequelize. |
| `backend/src/utils/asyncHandler.ts` | Encadena los errores de funciones asíncronas a `next`. Express 5 también puede propagar rechazos de promesas automáticamente. |
| `backend/src/controllers/sala.controller.ts` | **No contiene `try/catch`**; delega operaciones de negocio a `salaService.ts`. |
| `backend/src/services/salaService.ts` | Gestiona la creación de sala y butacas dentro de una transacción mediante `sequelize.transaction`. |
| `backend/src/controllers/pelicula.controller.ts` | Conserva **5** bloques `try/catch`. |
| `backend/src/controllers/funcion.controller.ts` | Conserva **6** bloques `try/catch`. |
| `backend/src/controllers/autentication.controller.ts` | Conserva **2** bloques `try/catch` y respuestas propias `{ ok, msg }`. |
| `backend/src/controllers/reservaButaca.controller.ts` | Conserva **2** bloques `try/catch`. |

**Conclusión:** tenemos un mecanismo centralizado de errores, pero **su adopción no es uniforme**. Sería incorrecto afirmar que se eliminaron todos los `try/catch`.

### 2.3. Decisión vigente

No vamos a eliminar `try/catch` indiscriminadamente. Distinguimos entre:

- **Captura con responsabilidad concreta:** recuperación, traducción deliberada de errores o manejo de recursos que requiera una acción específica. Puede ser necesaria.
- **Captura que solo reenvía el mismo error con `next(error)`:** puede simplificarse en rutas asíncronas ya cubiertas por `asyncHandler` o Express 5, siempre que se conserven los comportamientos y respuestas esperadas.
- **Respuestas HTTP construidas directamente en `catch`:** deben revisarse caso por caso para decidir si conviene unificarlas con `AppError` y `errorHandler`.

La prioridad es **consistencia sin regresiones**. La existencia de `errorHandler` no asegura que todas las respuestas del sistema utilicen su formato, especialmente cuando un controlador responde directamente.

### 2.4. Ejemplo concreto de mejora ya presente

Antes, según el análisis del Taller II, el controlador de salas también gestionaba una transacción y su `rollback`. En el código actual, `sala.controller.ts` se ocupa de traducir la solicitud HTTP y delega en `salaService.ts`; el servicio agrupa la creación de sala y butacas en una transacción. Esto refleja mejor la **responsabilidad única (SRP)** y permite localizar la regla de negocio fuera del controlador.

**Pendiente:** revisar gradualmente los controladores de películas, funciones, autenticación y reservas. No se declara que esa refactorización esté realizada.

## 3. Validación de productos y separación de responsabilidades

En el documento original se analizó la conveniencia de sacar validaciones repetidas del controlador de productos.

En el código actual, `backend/src/routes/productos.routes.ts` utiliza `validarProducto` y `validarActualizarProducto` antes de llamar a los controladores de alta y modificación. También aplica `validarToken` y `validarAdmin` a las operaciones administrativas.

**Decisión:** mantener las validaciones de entrada en middlewares y reservar los servicios/controladores para sus responsabilidades correspondientes. Así se reducen duplicaciones y se facilita ajustar el contrato de entrada en un lugar identificable. La seguridad debe comprobarse también desde la API, no solo ocultando botones en el frontend.

## 4. Autenticación y autorización: cambios desde el Taller II

En `backend/src/routes/index.ts` se monta `autenticacionRouter`; el archivo `backend/src/routes/autenticacion.routes.ts` expone registro e inicio de sesión. El registro en `autentication.controller.ts` crea usuarios con `rol: "cliente"`, aunque el cliente de la API envíe otro valor.

Las rutas de administración, como las de creación y edición de productos, emplean los middlewares `validarToken` y `validarAdmin`.

**Decisión:** conservar el rol de cliente como valor asignado por el servidor durante el registro y proteger los recursos administrativos en el backend. Para demostraciones locales, las cuentas `admin` se preparan de forma controlada en la base de datos, no mediante un registro público que permita elegir ese rol.

**Limitación:** no todas las rutas presentan exactamente el mismo esquema de autorización; antes de declarar la seguridad integral como verificada, hay que revisar y probar cada endpoint sensible.

## 5. Patrones de pago que evolucionaron desde el Taller II

El documento original enumera patrones como alternativas o propuestas. El proyecto actual **sí implementa Factory y Strategy** en el procesamiento de pagos:

- `backend/src/services/pagos/PaymentStrategy.ts`: contrato de la estrategia.
- `backend/src/services/pagos/PaymentFactory.ts`: selecciona la implementación según el medio de pago.
- `DebitoPayment.ts`, `CreditoPayment.ts`, `EfectivoPayment.ts`: implementaciones específicas.
- `backend/src/services/pagoService.ts`: coordina la transacción, valida el estado de la compra, prepara descuentos de stock y emite entradas al confirmar.

**Beneficio:** el servicio de pago no necesita incluir toda la lógica específica de cada medio en un único bloque de decisiones. Además, la verificación del stock agrupa cantidades del mismo producto y utiliza bloqueos transaccionales para reducir inconsistencias.

**No afirmamos** que el proyecto procese pagos bancarios reales: se trata de una simulación.

## 6. Verificaciones disponibles y resultados observados

| Verificación | Qué permite demostrar | Resultado conocido |
| --- | --- | --- |
| `backend`: `npm test` | Reglas relevantes en horarios, productos y pagos | **22/22 tests aprobados** en la ejecución local compartida. |
| `backend`: `npm run build` | Compilación TypeScript | Finalizó sin errores en la ejecución local. |
| `frontend`: `npm run lint` | Reglas de análisis estático configuradas | Finalizó sin errores en la ejecución local. |
| `frontend`: `npm run build` | Compilación TypeScript y Vite | Finalizó correctamente en la ejecución local. |
| GitHub Actions `backend-tests.yml` | Instalar dependencias, probar y compilar en un PR a `dev` |
| Pruebas manuales | Validar el recorrido de usuario real | Registro, login, cartelera, funciones, reservas, compra, entradas y Candy Bar comprobados durante la preparación. |

Estas verificaciones **no equivalen a cobertura total**, ni demuestran por sí solas ausencia de errores de concurrencia o seguridad. La protección visual de una butaca vendida no sustituye una prueba concurrente de doble venta desde la API.


## 7. Revisión de calidad: decisión y próximos pasos

La evolución de `sala.controller.ts` hacia `salaService.ts`, la centralización de errores y los middlewares de productos constituyen ejemplos concretos de decisiones de diseño ya observables en el código.

Como parte del Taller III, también realizamos un refactoring en `backend/src/services/pagoService.ts`. Reemplazamos una afirmación no nula (`!`) por un recorrido directo de las entradas del `Map`, utilizando `entries()`. Esto permitió mejorar la legibilidad y evitar una afirmación de tipo innecesaria, manteniendo las reglas de validación de stock y el orden de los bloqueos transaccionales.

Además, incorporamos dos pruebas automatizadas en `backend/tests/pagoService.test.ts`:

- **Caso límite:** comprar exactamente la cantidad disponible, verificando que el stock final sea 0.
- **Caso de error:** intentar comprar más unidades que las disponibles mediante líneas repetidas del mismo producto, verificando que se rechace la operación sin descontar stock.

Después de realizar los cambios, ejecutamos `npm test` y `npm run build`, obteniendo **22 tests aprobados y compilación TypeScript sin errores**.

La mejora está documentada en `docs/Revision_calidad_codigo.md`.

Proceso aplicado: crear rama de trabajo → revisar el código → implementar un cambio pequeño → ejecutar tests y compilación → documentar resultados → crear Pull Request hacia `dev`.

## 8. Límites y decisiones que mantenemos

1. No eliminamos `try/catch` solo por reducir líneas; cada uno se evalúa por su responsabilidad.
2. No consideramos que ESLint o un build exitoso garanticen el correcto funcionamiento de todas las funcionalidades.
3. No consideramos que el uso de JWT garantice automáticamente que todos los endpoints estén bien protegidos.
4. Mantenemos pagos simulados y documentamos sus limitaciones.
5. Conservamos el análisis del Taller II como registro histórico y utilizamos este documento como actualización del estado actual.

## 9. Relación con las clases 8, 9 y 10

- **Clase 8 — Documentación y optimización:** mantenemos documentación actualizada, diferenciamos la decisión inicial de su evolución y facilitamos que otro integrante entienda dónde está cada responsabilidad.
- **Clase 9 — Testing, verificación y validación:** justificamos casos normales, límite y error, y distinguimos tests automatizados de pruebas funcionales manuales.
- **Clase 10 — Calidad e integración continua:** usamos análisis estático, compilaciones y un workflow de GitHub Actions como controles automáticos, sin confundir su ejecución con cobertura total.

