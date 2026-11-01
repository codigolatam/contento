# Infraestructura de persistencia

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Crear la infraestructura de persistencia: conexión seleccionable por entorno, Drizzle Kit, flujo de migraciones y arnés de pruebas. No define tablas de dominio.

## Dependencias

- 001

## Entrada

- Tarea 001 completada.
- Sección «Prueba de concepto» de `docs/research/2026-10-stack-fundacion.md`.

## Resultado esperado

- Un módulo de conexión que usa PGlite sin `DATABASE_URL` y Postgres con ella.
- `drizzle.config.ts` apuntando al esquema y a la carpeta de migraciones.
- Un arnés de pruebas que aplica migraciones sobre PGlite en memoria.

## Criterios de calidad

- La prueba de humo (`SELECT 1`) pasa sobre PGlite y sobre Postgres 15 o superior.
- El flujo de generación de migraciones se ejecuta sin errores aunque el esquema esté vacío.
- Ninguna tabla de dominio se crea en esta tarea.

## Procedimiento sugerido

1. Crear el módulo de conexión con selección por `DATABASE_URL`.
2. Configurar `drizzle.config.ts` con dialecto `postgresql`.
3. Crear el arnés de pruebas con PGlite en memoria y migraciones.
4. Escribir la prueba de humo y ejecutarla con ambos drivers.

## Notas

- Las tablas de autenticación las genera el CLI de better-auth en la tarea 003, que traerá la primera migración con tablas.

## Contexto

- Archivos similares: `src/server/app.ts` (aplicación creada en una función, sin efectos) y `src/server/server.ts` (arranque que lee la configuración del entorno y valida). La persistencia sigue el mismo patrón: un módulo que construye la conexión a partir del entorno, probado sin abrir recursos externos.
- Patrones: TypeScript en modo estricto; código, identificadores, nombres de pruebas y mensajes en inglés; sin comentarios en el código; pruebas con nombres descriptivos y aserciones precisas; aislamiento del entorno con `vi.stubEnv` y limpieza en `afterEach`; umbral de cobertura del 100 % en `vitest.config.ts`.
- Dominio: `docs/domains/001-identidad-y-tenancy.md`. La tarea es infraestructura: no define entidades. Las invariantes del dominio llegan con las tareas 003 a 006.
- Producto: ninguna. `product-docs/` no describe comportamiento de usuario nuevo con esta tarea.
- PRD: `docs/prd/001-fundacion.md`. Ningún caso de uso `CU-N` describe la persistencia; es infraestructura.
- Lecciones: `docs/lessons/convenciones-de-codigo.md` (inglés en código y pruebas), `docs/lessons/pruebas.md` (diseño con ZOMBIE, revisión antes de presentar, pruebas que fallen cuando el código está mal).
- Decisiones: D001 (stack con Drizzle) y D002 (un único esquema `pg-core`, PGlite en desarrollo y tests, Postgres en producción). Esta tarea implementa D002.
- Investigación de apoyo: `docs/research/2026-10-stack-fundacion.md`, sección «Prueba de concepto». Confirma que Drizzle Kit migra el esquema sobre PGlite y sobre Postgres 15 con el mismo resultado.
- Referencia de código fuera del repositorio: `/tmp/spike-fundacion/src/db.ts` contiene la selección de driver que la prueba de concepto validó. No se copia al repositorio; sirve de referencia para la forma del módulo.

## Conectividad

- Veredicto: conectada.
- Justificación: la tarea parte del scaffold de la tarea 001, que ya tiene el servidor, el arranque, la validación de `PORT` y el umbral de cobertura. Drizzle, Drizzle Kit, PGlite y el cliente `pg` no están instalados todavía; se instalan desde npm, como las dependencias de la tarea 001. Postgres real no forma parte de la suite automática: se verifica con `DATABASE_URL` como la prueba de concepto.

## Plan técnico

- [x] Instalar `drizzle-orm@0.45.4`, `drizzle-kit@0.31.11`, `@electric-sql/pglite@0.5.13` y `pg`, con las versiones de la prueba de concepto.
  - Aporta: versiones ya validadas, para que las migraciones no cambien de comportamiento sin aviso.
- [x] Crear `src/server/schema.ts` vacío.
  - Aporta: `drizzle-kit` tiene un esquema al que apuntar desde el primer día; las tareas 003 a 006 solo añaden tablas.
- [x] Crear `src/server/database.ts`: usa PGlite si no hay `DATABASE_URL` y Postgres si la hay; expone la conexión y una función para aplicar migraciones.
  - Aporta: un único punto de acceso a la base de datos para el resto de la aplicación.
- [x] Crear `drizzle.config.ts` en la raíz, con dialecto `postgresql`, el esquema de `src/server/schema.ts` y la carpeta `drizzle/`.
  - Aporta: `drizzle-kit generate` funciona aunque el esquema esté vacío.
- [x] Escribir las pruebas con PGlite en memoria, sin recursos externos.
  - Aporta: `npm test` sigue funcionando sin Docker ni variables de entorno.
- [x] Verificar contra Postgres 15 real durante la tarea, con `DATABASE_URL`, y registrar el resultado en el archivo de la tarea. No queda como prueba permanente del repositorio.
  - Aporta: la evidencia de que el mismo esquema funciona en producción, sin acoplar la suite a un servidor externo.

## Suite de pruebas esperada

Ninguna expectativa tiene caso de uso propio, porque el PRD no describe la persistencia. Cada una se ancla a un criterio de calidad de la tarea.

- Con PGlite en memoria, `SELECT 1` devuelve 1. (O)
- Aplicar migraciones sobre un esquema vacío termina sin error y sin crear tablas. (Z)
- Aplicar las migraciones dos veces seguidas no falla. (B)
- Con dos migraciones aplicadas, ambas tablas existen. (M)
- Una conexión a un servidor inalcanzable falla con el código de error `ECONNREFUSED`, tanto al consultar como al migrar. (E)
- El módulo expone la conexión y la función de migración. (I)
- Regresión: tipado, linter y pruebas con cobertura del 100 %.
- Durante la tarea, `SELECT 1` y las migraciones pasan contra Postgres 15 real. Verificación manual, no queda en la suite.

## Notas

- Verificación manual contra Postgres 15.18 (imagen `postgres:15-alpine` ya presente en la máquina, contenedor efímero eliminado tras la prueba): `SELECT 1` devuelve 1; las migraciones se aplican dos veces sin error y no crean tablas sobre el esquema vacío; una conexión a un puerto cerrado falla con `ECONNREFUSED`. El script de verificación estaba fuera del repositorio.
- Las tablas de autenticación las genera el CLI de better-auth en la tarea 003, que traerá la primera migración con tablas.
- La letra M de ZOMBIE está cubierta: una prueba aplica dos migraciones y comprueba que ambas tablas existen.
- ESLint ignora `.venv-docs/` porque contiene el entorno de MkDocs, con archivos JS y Python que no son código del proyecto. Ignora `site/` de forma preventiva: es la salida de `mkdocs build`.
- Las pruebas de migración usan carpetas temporales con su propio journal. Así cada prueba falla si `migrate` no aplica las migraciones; se comprobó con una mutación que deja `migrate` como no-op.

## Revisión

- Subagente: 2026-10-31 — Aprueba
- Usuario (ejecución): 2026-11-01 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
