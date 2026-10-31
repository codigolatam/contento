# Verificación automática

Esta página es para el equipo. Relaciona cada comportamiento que describen las guías de usuario con la prueba que lo comprueba en cada cambio. Si una prueba se rompe o cambia de nombre, esta página debe actualizarse.

## Abrir la aplicación

| Comportamiento | Prueba |
|---|---|
| La página de inicio muestra el nombre del producto como encabezado principal. | `App.test.tsx`: «renders the product name as the top-level heading» |
| La aplicación se monta dentro del contenedor de la página. | `main.test.tsx`: «mounts the app inside the #root element» |
| Una ruta inexistente responde con un error de página no encontrada en texto plano. | `app.test.ts`: «returns plain 404 text for unknown routes» |

## Arrancar el servicio

| Comportamiento | Prueba |
|---|---|
| El servicio escucha en el puerto 3000 cuando no se define `PORT`. | `server.test.ts`: «listens on port 3000 when PORT is not set» |
| Un valor no válido en `PORT` impide el arranque. | `server.test.ts`: «rejects the invalid port %j» |
| `/health` responde 200 con el estado `ok`. | `app.test.ts`: «returns 200 with an ok status payload» |
| Los archivos fuera de la carpeta compilada no se sirven. | `app.test.ts`: «does not serve files outside the web root for the encoded traversal path %s» |
