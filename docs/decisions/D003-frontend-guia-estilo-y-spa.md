# D003: Frontend gobernado por guía de estilo, como SPA con fallback en el servidor

## Estado

Aceptada

## Contexto

El esqueleto de navegación exigía elegir cómo se estructura la interfaz: qué enrutador usa la aplicación React, cómo responde el servidor a las rutas del cliente y de dónde salen los valores visuales cuando no existía ninguna convención de estilo.

## Decisión

- La aplicación web es un SPA enrutado con `react-router`: el cliente posee las rutas y el servidor responde `index.html` a toda GET de navegación —sin extensión, fuera de `/api` y sin `..`— manteniendo 404 para archivos, API, traversal y otros métodos.
- Todo valor visual se declara en `DESIGN.md` y se materializa en tokens `:root` de `src/web/theme.css`; un literal fuera de los tokens es deriva, salvo los literales estructurales —ceros, porcentajes, `auto`/`none` y breakpoints de media query—.

## Justificación

Las superficies crecerán con parámetros —identificadores de serie y de pieza— y un enrutador propio quedaría obsoleto en la primera de ellas; `react-router` es la línea madura para React 19. El fallback en el servidor es lo que permite que `/pipeline` responda 200 en producción sin listar rutas duplicadas en el backend. La guía convierte cada decisión estética en un contrato verificable con su razón, en lugar de literales dispersos que nadie puede revisar.

Consecuencias:

- Toda ruta registrada en el servidor fuera de `/api` queda sombreada por el fallback si es GET sin extensión —los endpoints nuevos viven bajo `/api` o se excluyen del chequeo—.
- Cada cambio de frontend debe cumplir la guía; las decisiones de estilo entran por `DESIGN.md` antes que por el código.
- La regla del breakpoint se declara en la guía pero no puede ser token: las media queries no consumen custom properties.

## Referencias

- `DESIGN.md`
- `docs/tasks/007-navegacion.md`
- `src/server/app.ts`
