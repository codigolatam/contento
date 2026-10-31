# Scaffold del servicio y de la aplicación web

## Estado

[r] En revisión

## Tipo

desarrollo

## Objetivo

Crear la base TypeScript de un solo proceso: servidor Hono sobre Node y aplicación web React, con su compilación, tipado, pruebas y arranque. No define modelos de dominio ni tablas.

## Dependencias

- Ninguna.

## Entrada

- Propuesta 001 aprobada.
- Node 22.22.2 o superior, con los rangos que exigen las dependencias (jsdom 30 y Vitest 5).
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

## Contexto

- Archivos similares: ninguno. El repositorio no tiene código todavía; esta tarea crea el primero.
- Patrones: ninguno vigente en el código. Las decisiones de stack vienen de `docs/research/2026-10-stack-fundacion.md`: Hono sobre Node con `@hono/node-server`, React para la web y TypeScript en modo estricto. Node 22.22.2 o superior, con los rangos que exigen las dependencias (jsdom 30 y Vitest 5).
- Dominio: ninguna. `docs/domains` no existe y la tarea no define modelo de dominio.
- Producto: ninguna. `docs/product` no existe.
- PRD: `docs/prd/001-fundacion.md`. Ningún caso de uso `CU-N` describe el scaffold; el comportamiento que declara (CU-1 a CU-5) los cubrirán las tareas 003 a 005; esas tareas deben referenciarlos al planearse. Esta tarea no tiene caso de uso propio: es infraestructura.
- Lecciones: ninguna. `EXPERIENCIAS.md` no tiene entradas y `docs/lessons` no existe.
- Decisiones: ninguna registrada. `docs/decisions` no existe; el stack está fijado en la propuesta 001 y en la investigación.
- Investigación de apoyo: `docs/research/2026-10-stack-fundacion.md`, sección de límites: Node 24 verificado, Node 20 o superior exigido por `@hono/node-server`.

## Conectividad

- Veredicto: conectada.
- Justificación: la tarea parte de un repositorio sin código y no asume infraestructura previa. Hono, `@hono/node-server`, React, el bundler y el tipado se instalan desde npm. No hay supuestos sobre el código existente que contrastar.

## Plan técnico

Resumen del subsistema: el repositorio no tiene código. Esta tarea crea el primer proyecto TypeScript, con un servidor Hono en `src/server` y una aplicación React en `src/web`, empaquetada con Vite y probada con Vitest.

- [x] Crear el proyecto TypeScript con modo estricto y los scripts de arranque, compilación, tipado, lint y pruebas.
  - Aporta: una base común. El modo estricto evita errores de contrato cuando lleguen las tareas de dominio.
- [x] Configurar ESLint con reglas de TypeScript estricto, React y hooks.
  - Aporta: las convenciones se verifican con una herramienta y no solo con revisión humana.
- [x] Crear el servidor Hono sobre el adaptador de Node, con la ruta `/health` y la función de creación de la aplicación separada del arranque.
  - Aporta: la aplicación se prueba sin abrir puertos, y el arranque queda en un único archivo pequeño.
  - Contexto: `@hono/node-server` exige Node 20 o superior.
- [x] Servir la aplicación React desde el mismo servidor.
  - Aporta: la superficie de la aplicación, sin proceso separado en producción.
  - Contexto: la ruta `/health` no depende de la compilación de la web.
- [x] Configurar Vite para la web, con un proxy de `/health` hacia el servidor en desarrollo.
  - Aporta: en desarrollo, la web y el servidor se levantan juntos sin configuración manual.
- [x] Escribir pruebas unitarias de la aplicación, del arranque del servidor y de la web, con cobertura del 100 % de líneas, ramas, funciones y sentencias como umbral del comando de pruebas.
  - Aporta: el umbral impide que el código sin probar entre al repositorio sin que el comando falle.
  - Contexto: el arranque del servidor se prueba con `@hono/node-server` mockeado, sin abrir puertos. El montaje de React se prueba en jsdom, con `react-dom/client` envuelto para desmontar cada raíz al terminar.

## Suite de pruebas esperada

Ninguna expectativa tiene caso de uso propio: el PRD no describe el scaffold, así que cada una se ancla a un criterio de calidad de la tarea. Esta laguna se declara en la tarea y queda confirmada por la aprobación del plan.

- Al arrancar en desarrollo, el servidor y la web se levantan sin error. (regresión, verificación manual con `npm run dev`)
- `/health` responde 200 con el cuerpo `{"status":"ok"}` y tipo JSON. (O, I)
- Con la raíz web vacía, la raíz responde 404. (Z)
- La raíz sirve `index.html`, y todos los archivos de la raíz web se sirven. (O, M)
- Una ruta inexistente responde 404 con texto plano. (B)
- Un archivo fuera de la raíz web no se sirve, aunque la ruta esté codificada. (E)
- Sin `PORT` el servidor escucha en 3000. Los puertos 1 y 65535 se aceptan; 0, 65536, 1.5, `abc`, `0x10`, `1e3` y los valores con espacios se rechazan con error. (O, B, E)
- El arranque no requiere configuración de base de datos. (B)
- El tipado, el linter y las pruebas pasan, con cobertura del 100 %. (regresión)

## Notas

- El arranque de producción exige `npm run build` antes de `npm start`. Sin `dist/`, la API responde y la web devuelve 404.
- El puerto de desarrollo del proxy de Vite sigue la variable `PORT`.

## Revisión

- Subagente: 2026-10-30 — Aprueba
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
