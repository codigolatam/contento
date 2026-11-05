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

## Crear una cuenta y entrar

| Comportamiento | Prueba |
|---|---|
| Registrarse devuelve una cookie de sesión y `/api/me` responde el correo con ella. | `auth.test.ts`: «returns a session cookie on sign-up and serves the user with it» |
| Registrarse sin los campos requeridos es rechazado. | `auth.test.ts`: «rejects a sign-up without the required fields» |
| Registrarse con un correo ya usado es rechazado. | `auth.test.ts`: «rejects a sign-up with an email that is already registered» |
| Entrar con credenciales válidas devuelve una cookie; salir la invalida. | `auth.test.ts`: «signs in with the registered credentials and invalidates the session on sign-out» |
| Entrar con una contraseña incorrecta o un usuario inexistente es rechazado. | `auth.test.ts`: «rejects a sign-in with a wrong password», «rejects a sign-in with a user that does not exist» |
| `/api/me` sin sesión responde 401. | `auth.test.ts`: «rejects a request to the protected route without a session» |
