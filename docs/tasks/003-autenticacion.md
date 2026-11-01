# Autenticación con better-auth

## Estado

[r] En revisión

## Tipo

desarrollo

## Objetivo

Autenticación por correo y contraseña con better-auth, con su esquema generado por el CLI sobre el adaptador de Drizzle.

## Dependencias

- 002

## Entrada

- Tarea 002 completada.
- Sección «Prueba de concepto» de `docs/research/2026-10-stack-fundacion.md`.

## Resultado esperado

- Registro, inicio y cierre de sesión.
- Sesiones persistidas en la base de datos.
- Tablas de autenticación generadas y migradas.

## Criterios de calidad

- El esquema de autenticación se genera con `@better-auth/cli generate`, no se escribe a mano.
- Registro e inicio de sesión funcionan sobre PGlite y sobre Postgres real.
- Una ruta protegida rechaza una petición sin sesión y acepta una con sesión válida.
- better-auth y su CLI quedan fijados a la misma versión.

## Procedimiento sugerido

1. Configurar better-auth con el adaptador de Drizzle y `provider: "pg"`.
2. Generar el esquema con el CLI y revisar su diff.
3. Generar y aplicar la primera migración.
4. Montar las rutas de autenticación en Hono y probar registro, inicio y cierre de sesión.

## Notas

- Auth.js queda descartado, como documenta la investigación.

## Desviaciones

- El esquema se genera con `npx auth generate`, no con `@better-auth/cli`. Desde better-auth 1.5 el paquete `auth` es el CLI oficial y `@better-auth/cli` está deprecado; además `auth@1.7.14` depende exactamente de `better-auth@1.7.14`, así que el criterio de «fijados a la misma versión» se cumple mejor que con el paquete antiguo (cuya última versión estable es 1.4.22, de otra línea).
- `schema.ts` queda excluido de la cobertura: es código generado por el CLI y sus funciones `$onUpdate` no son comportamiento propio que probar. La exclusión está en `vitest.config.ts`.
- `testTimeout` sube a 30 s en `vitest.config.ts` porque arrancar PGlite y aplicar migraciones en cada importación de `server.ts` supera los 5 s por defecto bajo carga.
- `auth.ts` exporta una instancia `auth` creada sobre una base en memoria para que el CLI encuentre la configuración. El servidor crea la suya con `createAuth(database)`; la instancia exportada solo sirve a las herramientas.
- better-auth se fijó a 1.7.14, la versión validada por la prueba de concepto, aunque tiene seis días de publicación; la alternativa más antigua no estaba verificada.
- `PGLITE_DATA_DIR` controla el directorio de datos de PGlite; por defecto es `.pglite-data` en la raíz del repositorio (ignorado por git) para que el desarrollo conserve las cuentas entre arranques.

## Verificación manual

- Contra Postgres 15.18 (imagen `postgres:15-alpine` local, contenedor efímero eliminado tras la prueba): registro responde 200 con cookie de sesión; `GET /api/me` devuelve el correo con la cookie y 401 sin ella; el inicio de sesión responde 200; las tablas `account`, `session`, `user` y `verification` existen tras la migración.

## Contexto

- Archivos similares: `src/server/database.ts` (módulo que construye la conexión a partir del entorno y la expone como función pura con `close()`), `src/server/server.ts` (arranque que lee y valida la configuración del entorno) y `src/server/app.ts` (aplicación sin efectos, probada sin abrir puertos). La autenticación sigue el mismo patrón: `createAuth` recibe la conexión y devuelve el manejador, sin leer el entorno dentro del handler.
- Patrones: TypeScript estricto; código, identificadores, nombres de pruebas y mensajes en inglés; sin comentarios; pruebas con nombres descriptivos y aserciones precisas; aislamiento con `vi.stubEnv` y limpieza en `afterEach`; cobertura del 100 %; las verificaciones con servicios externos se hacen manualmente, fuera de la suite.
- Dominio: `docs/domains/001-identidad-y-tenancy.md` marca las entidades de cuenta como pendientes de ancla a código; esta tarea trae `user`, `session`, `account` y `verification`, y las primeras anclas reales.
- Producto: el registro y el inicio de sesión son funcionales pero solo por API; todavía no hay interfaz de usuario. El sensor de producto del cierre decidirá si merece documentación en `product-docs/`.
- PRD: `docs/prd/001-fundacion.md`, CU-1 (registro e inicio de sesión por correo y contraseña).
- Lecciones: `docs/lessons/convenciones-de-codigo.md`, `docs/lessons/pruebas.md` (ZOMBIE y la verificación externa fuera de la suite, que esta tarea aplica a Postgres).
- Decisiones: D001 (better-auth para cuentas) y D002 (el esquema se mantiene con `pg-core` y migra igual en PGlite y en Postgres).
- Investigación de apoyo: `docs/research/2026-10-stack-fundacion.md`, sección «Prueba de concepto». Confirma que el CLI genera las cuatro tablas `pg-core`, que la misma migración corre en PGlite y en Postgres 15 y que el registro funciona con `emailAndPassword` habilitado.
- Referencia de código fuera del repositorio: `/tmp/spike-fundacion/src/auth.ts` tiene la forma del `betterAuth` con `drizzleAdapter` y `emailAndPassword`. No se copia; los plugins de organización y api-key pertenecen a las tareas 004 y 005 y no entran aquí.

## Conectividad

- Veredicto: conectada.
- Justificación: la tarea 002 completada deja `createDatabase` con migraciones inyectables. better-auth y `@better-auth/cli` no están instalados; se instalan desde npm fijados a la misma versión. Postgres real no forma parte de la suite: se verifica manualmente, como en la tarea 002. El esquema generado por el CLI se añade a `src/server/schema.ts`, que ya existe y está vacío.

## Plan técnico

- [x] Instalar `better-auth` y `@better-auth/cli` fijados a la misma versión.
  - Aporta: el criterio de calidad que exige versiones iguales; en el spike diferían y se verificó que funcionaban, pero se fijan iguales.
- [x] Crear `src/server/auth.ts` con `createAuth`, que recibe la conexión de `database.ts`, configura el adaptador de Drizzle con `provider: "pg"` y habilita `emailAndPassword`.
  - Aporta: el punto de acceso a la autenticación, sin leer el entorno dentro del handler.
- [x] Generar el esquema con `@better-auth/cli generate` y revisar el diff sobre `schema.ts`.
  - Aporta: las cuatro tablas `user`, `session`, `account` y `verification`, como exige el criterio de que el esquema no se escribe a mano.
- [x] Generar la primera migración con `drizzle-kit generate` y commitear `drizzle/`.
  - Aporta: la primera migración real, que se aplica igual en PGlite y en Postgres.
- [x] Montar el manejador de better-auth y una ruta protegida `GET /api/me` en el servidor.
  - Aporta: registro, inicio y cierre de sesión por API, y el criterio de la ruta protegida.
- [x] Añadir un directorio de datos opcional a `createDatabase`, que `server.ts` pasa para que PGlite guarde en disco en desarrollo.
  - Aporta: los registros no se pierden al reiniciar en desarrollo; las pruebas siguen en memoria.
- [x] Verificar registro e inicio de sesión contra Postgres 15 real durante la tarea.
  - Aporta: el criterio de que funciona en producción, sin quedar en la suite.

## Suite de pruebas esperada

Cada expectativa se ancla a CU-1 del PRD o a un criterio de la tarea.

- El registro sin los campos requeridos es rechazado. (Z, CU-1)
- Registrarse devuelve una sesión; entrar con esas credenciales devuelve una cookie de sesión; salir la invalida. (O, CU-1)
- Dos usuarios registrados pueden entrar; registrarse con un correo ya usado es rechazado. (M, B)
- Entrar con una contraseña incorrecta es rechazado; `GET /api/me` sin sesión responde 401. (B, CU-1)
- `GET /api/me` con sesión responde 200 con el correo del usuario; las respuestas de autenticación son JSON. (I, CU-1)
- Un cuerpo JSON malformado recibe un 4xx, no un 500; entrar con un usuario inexistente es rechazado. (E)
- Regresión: tipado, linter y pruebas con cobertura del 100 %.
- Durante la tarea, registro e inicio de sesión pasan contra Postgres 15 real. Verificación manual, no queda en la suite.

## Revisión

- Subagente: 2026-11-01 — Aprueba
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
