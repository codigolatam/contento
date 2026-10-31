# Infraestructura de persistencia

## Estado

[ ] Pendiente

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
