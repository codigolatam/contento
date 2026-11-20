# Esqueleto de navegación de la aplicación editorial

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Crear el esqueleto de navegación de la aplicación editorial: layout compartido y rutas de marcador donde se montarán las superficies de trabajo de las propuestas 002 y 003.

## Dependencias

- 001

## Entrada

- Tarea 001 completada.

## Resultado esperado

- Un layout con barra lateral y encabezado, con espacio reservado para el workspace activo.
- Rutas de marcador para el pipeline, las series y las piezas, sin funcionalidad.

## Criterios de calidad

- El layout no contiene lógica de dominio.
- Ningún valor de estilo es literal: colores, tipografía y espaciado salen de variables CSS centralizadas.
- Cada ruta de marcador responde con estado 200 y un texto que identifica la superficie.

## Procedimiento sugerido

1. Definir el layout compartido y su estructura de navegación.
2. Crear las rutas de marcador.
3. Centralizar las variables de estilo en un único archivo.

## Notas

- El selector de workspace activo se completa cuando exista la tarea 004.

## Contexto

- La aplicación web es `src/web/App.tsx` (un `<h1>` de andamio) montada por `src/web/main.tsx` sobre `#root` de `index.html` (`lang="es"`): no hay router ni hoja de estilos — todo el layout y la navegación nacen en esta tarea. El ciclo de vida ya está trazado por `src/web/App.test.tsx` y `src/web/main.test.tsx` (jsdom + `@testing-library/react`).
- El servidor (`createApp` en `src/server/app.ts`) sirve el `webRoot` estático sin fallback: toda GET desconocida devuelve 404 de texto plano —contrato fijado por la prueba «returns plain 404 text for unknown routes»—, así que las rutas de marcador exigen un fallback SPA que preserve los rechazos actuales: traversal (`..`), archivos inexistentes y `/api/*`.
- No existe guía de estilo ni tokens: el criterio «ningún valor de estilo literal» requiere crear en esta tarea el archivo central de variables CSS que la consumirán.
- `package.json` no incluye router: añadir uno es una dependencia nueva (las superficies crecerán con parámetros en las propuestas 002 y 003), frente a la alternativa de un enrutador mínimo propio.
- La cobertura del 100 % aplica también a la web: cada componente del layout y cada ruta necesita su prueba jsdom.
- La etiqueta del workspace activo es solo un espacio reservado sin lógica; su comportamiento real vendrá de un trabajo posterior sobre la tarea 004 ya completada.
- La voz del producto es española (PRD y `lang="es"`): las superficies y etiquetas de navegación van en español.

## Conectividad

- Supuesto: la aplicación web compila y se monta en pruebas jsdom → `src/web/main.tsx` monta `App` sobre `#root` y `App.test.tsx`/`main.test.tsx` lo trazan con `@testing-library/react` ✅
- Supuesto: el servidor puede servir rutas de marcador → `createApp` sirve el `webRoot` estático; el fallback SPA es una extensión sobre ese mismo módulo sin cambiar su superficie (`createApp(webRoot)`) ✅
- Supuesto: las pruebas del servidor usan un `webRoot` falso en `tmp` → el patrón ya existe en `app.test.ts` (`mkdtemp` + fixture `index.html`), la suite nueva lo reutiliza ✅
- Supuesto: ninguna superficie de marcador necesita datos → todas son placeholders estáticos por criterio de la tarea ✅
- Lo que falta —router, tokens de estilo, layout, fallback— es la propia tarea; nada bloquea.

Veredicto: conectada. Con la nota de que «cada ruta responde 200» implica modificar el contrato del servidor (fallback SPA), no solo la web.

## Plan técnico

La aplicación web es un SPA React sin router ni estilos (`src/web/App.tsx` es un `<h1>`) y el servidor sirve `dist` sin fallback —toda GET desconocida da 404—. El esqueleto toca ambos lados: web (layout + rutas) y servidor (fallback SPA). Se añade `react-router` (v7) como dependencia nueva —las superficies crecerán con parámetros en las propuestas 002 y 003— y se crea la guía de estilo del proyecto (`DESIGN.md` + tokens CSS) con propuesta razonada y validación visual.

- [x] Crear `DESIGN.md` con la guía de estilo: tokens de color, tipografía y espaciado con su justificación
- [x] Añadir `react-router` (versión estable, publicada hace ≥7 días) y montar el router en `App.tsx`
- [x] Crear `src/web/theme.css` (variables `:root` según la guía) y `src/web/app.css` (layout consumiendo solo variables)
- [x] `Layout` compartido: sidebar con los tres enlaces, header con nombre del producto y espacio reservado para el workspace activo; las tres superficies de marcador; `/` redirige a `/pipeline`
- [x] Fallback SPA en `createApp`: GET sin extensión, fuera de `/api` y sin `..` sirve `index.html`; se actualiza la prueba del 404 genérico
- [x] Pruebas jsdom del layout y las rutas + regresión completa (tipado, lint, 100 %)
- [x] Verificación manual: `npm run build && npm start`, `curl` a cada ruta → 200, y validación visual del layout renderizado con Firefox

## Pruebas esperadas

El PRD pide este esqueleto como entrega del hito 1 (secciones pipeline, series y piezas).

- La ruta `/` redirige a `/pipeline`. (Z)
- Cada ruta `/pipeline`, `/series` y `/piezas` renderiza dentro del layout un texto que identifica su superficie. (O)
- La barra lateral enlaza a las tres superficies y el encabezado muestra el nombre del producto con el espacio reservado para el workspace activo. (M)
- El servidor sirve `index.html` para una GET de ruta sin extensión desconocida; sigue devolviendo 404 para GET de archivo inexistente, GET bajo `/api`, path con `..` y POST a ruta desconocida. (B)
- El esqueleto no hace llamadas de red: ningún render de ruta invoca `fetch`. (I)
- `GET /pipeline` responde 200 con el `index.html` del webRoot en la aplicación real. (I)
- Regresión: tipado, linter y pruebas con cobertura del 100 %, incluidos los archivos web nuevos.
- Durante la tarea: `build` + `start` y `curl` a las cuatro rutas devuelven 200, y el layout se valida visualmente con Firefox. Verificación manual, no queda en la suite.

## Verificación manual

- `npm run build && npm start` con `curl`: `/`, `/pipeline`, `/series`, `/piezas` y una ruta inexistente sin extensión responden 200 con `index.html`; un archivo inexistente (`/missing.css`) y `/api/unknown` responden 404.
- Validación visual con Firefox (servidor en `:3000`): layout renderizado a 1440px, en el borde del breakpoint (769px sidebar / 768px fila) y a 390px — el colapso a nav horizontal funciona en ambos sentidos y la marca activa migra del borde izquierdo al inferior.
- La dirección de diseño se iteró con evidencia renderizada hasta la aprobación del usuario: indicador de sección como regla recta `::before` (el `box-shadow` heredaba el radio y se veía como paréntesis), sidebar 200px (no 240px) y breakpoint 768px (no 640px).

## Desviaciones

- Dependencia nueva `react-router` fijada en `7.18.5` exacta (aprobada en el plan): la 7.18.6 salió hace 2 días — por la regla de antigüedad ≥7 días se fija la 7.18.5 en lugar del rango `^` habitual.
- Tras la revisión técnica: el fallback excluye también la raíz exacta `/api` (además de `/api/*`) — con test que fija la frontera (`/apiculture` sigue siendo navegación); y todos los valores visuales quedaron tokenizados en `theme.css` (bordes, indicador, anillo de foco, pesos y alturas de línea), declarados en `DESIGN.md`.
- `vitest.config.ts` gana `hookTimeout: 30000` alineado con `testTimeout`: los `beforeEach` que levantan PGlite + migraciones superaban el default de 10s bajo paralelismo (flaky ya observado en la tarea 006); el ajuste elimina los timeouts intermitentes en las corridas de regresión.
- `DESIGN.md` nace en esta tarea como guía de estilo del proyecto — el plan la contemplaba como opcional y el usuario la aprobó con propuesta razonada y validación visual.
- El router añade una ruta comodín `*` que redirige a `/pipeline` — mantiene toda URL dentro de la app; no estaba en el checklist y es un detalle de la misma decisión de enrutado.
- El fallback SPA aplica a GET sin extensión fuera de `/api` y sin `..` tras decodificar el path — el 404 plano de rutas desconocidas cambia de contrato a propósito (criterio de la tarea) y se preserva para archivos, `/api`, traversal y métodos no GET.

## Revisión

- Subagente: 2026-11-20 — Aprueba (revisión inicial solicitó cambios por literales CSS no tokenizados y `GET /api` sin excluir; corregidos y verificados en re-revisión)
- Usuario (ejecución): 2026-11-20 — Aprueba
- Usuario (cierre): 2026-11-20 — Aprueba
