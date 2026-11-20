# D003: La aplicación web es un SPA enrutado por el cliente, con fallback en el servidor

## Estado

Aceptada

## Contexto

El esqueleto de navegación exigía que `/pipeline`, `/series` y `/piezas` respondieran 200 con un texto que identifica cada superficie, en una aplicación React montada por Vite sin enrutador. Tres decisiones se escondían ahí: quién posee las rutas (cliente o servidor), qué librería de enrutado usar y cómo responde el servidor a una ruta de cliente en producción —donde `dist` es estático y una GET a `/pipeline` daba 404.

Las alternativas eran:

- **Rutas poseídas por el servidor** —una entrada HTML por sección o renderizado en el servidor—: duplica la navegación en dos lenguajes y contradice el scaffold SPA ya existente; la navegación entre superficies sería recarga completa.
- **Enrutador propio mínimo** —`pushState` y un switch sobre `location.pathname`—: unas decenas de líneas hoy, pero las superficies futuras llevan parámetros (`/series/:id`, `/piezas/:id`), redirects y estado de historial; reescribir `react-router` a mano es deuda segura.
- **`react-router` + fallback SPA** —el cliente posee las rutas y el servidor sirve `index.html` a toda GET de navegación—: una sola fuente de rutas, la convención madura para React 19.

Para el fallback mismo se evaluó listar las rutas del cliente en el servidor —queda desincronizado en cuanto nazca una cuarta superficie— y enrutado por hash —`#/pipeline` rompe la idea de que una dirección identifica una superficie— frente a un predicado sobre la petición.

## Decisión

- La aplicación usa `react-router` (v7): `BrowserRouter` en `App`, rutas declaradas en `routes.tsx`, `NavLink` con `aria-current` para la sección activa y un comodín `*` que redirige lo desconocido a `/pipeline`.
- El servidor sirve `index.html` a toda **GET de navegación**: sin extensión en el path, fuera de `/api` (raíz exacta y prefijo) y sin `..` tras decodificar la URL. Archivos inexistentes, traversal codificado, `/api` y métodos no GET siguen devolviendo 404.

## Justificación

Las rutas se declaran una sola vez —en el cliente— y el servidor no mantiene una lista que se desincronizaría con cada superficie nueva. El predicado de navegación preserva el contrato anterior donde importa: el 404 anti-traversal y la frontera `/api` intactos, porque decodificar la URL antes del chequeo impide que `%2e%2e` o `/%61pi` se conviertan en bypass.

Consecuencias:

- Toda ruta GET registrada en el servidor fuera de `/api` queda sombreada por el fallback: los endpoints nuevos viven bajo `/api` o se excluyen del chequeo explícitamente.
- El comodín del router absorbe los typos de sección hacia `/pipeline` —aún no existe una página 404 de producto; si se quiere, es una decisión de la guía de producto, no del fallback—.
- El error de página no encontrada para archivos inexistentes sigue siendo el texto plano por defecto del servidor.

## Referencias

- `src/server/app.ts` (`isNavigationPath`, fallback `GET *`)
- `src/web/routes.tsx`, `src/web/Layout.tsx`
- `docs/tasks/007-navegacion.md`
