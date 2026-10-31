# Scaffold del servicio y de la aplicación web

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Crear la base TypeScript de un solo proceso: servidor Hono sobre Node y aplicación web React, con su compilación, tipado, pruebas y arranque. No define modelos de dominio ni tablas.

## Dependencias

- Ninguna.

## Entrada

- Propuesta 001 aprobada.
- Node 20 LTS como mínimo.
- Investigación `docs/research/2026-10-stack-fundacion.md`.

## Resultado esperado

- Un proyecto que arranca un servidor Hono y sirve una página React de prueba.
- Comandos de arranque, tipado y pruebas que pasan.

## Criterios de calidad

- `npm run dev` levanta el servidor y la aplicación web sin errores.
- La ruta `/health` responde con estado 200.
- El tipado pasa en modo estricto.
- Ninguna tabla ni modelo de dominio se crea en esta tarea.

## Procedimiento sugerido

1. Crear la estructura del proyecto y la configuración de TypeScript.
2. Montar Hono sobre `@hono/node-server` con la ruta `/health`.
3. Montar la aplicación web React y servirla desde el servidor.
4. Añadir los scripts de arranque, tipado y pruebas.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
