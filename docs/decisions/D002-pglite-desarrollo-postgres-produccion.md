# D002: PGlite en desarrollo y Postgres en producción con un único esquema

## Estado

Aceptada

## Contexto

Drizzle es específico de dialecto: un esquema para SQLite y otro para Postgres obligan a mantener dos definiciones de cada tabla. Las opciones eran levantar Postgres con Docker en desarrollo, usar SQLite también en producción o usar PGlite, que es Postgres compilado a WASM y corre dentro de Node.

## Decisión

Mantenemos un único esquema `pg-core`. Usamos PGlite en desarrollo y en las pruebas, y Postgres en producción.

## Justificación

Un solo esquema evita divergencias entre entornos. PGlite no necesita Docker, así que cualquiera puede ejecutar las pruebas con `npm test`. SQLite en producción abandonaría Postgres, que es la base de la propuesta.

Consecuencias:

- PGlite no sustituye a Postgres real. Las migraciones y las pruebas de integración se validan también contra Postgres 15 o superior.
- PGlite admite una sola conexión, así que no es apropiado para pruebas de concurrencia.

## Referencias

- `docs/research/2026-10-stack-fundacion.md`
- `docs/tasks/002-persistencia.md`
