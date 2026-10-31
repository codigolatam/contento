# Autenticación con better-auth

## Estado

[ ] Pendiente

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
