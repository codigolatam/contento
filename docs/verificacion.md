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
| Registrarse crea exactamente un workspace personal con el nombre del usuario. | `workspaces.test.ts`: «creates exactly one personal workspace named after the user on sign-up» |
| Registrarse sin los campos requeridos es rechazado. | `auth.test.ts`: «rejects a sign-up without the required fields» |
| Registrarse con un correo ya usado es rechazado. | `auth.test.ts`: «rejects a sign-up with an email that is already registered» |
| Entrar con credenciales válidas devuelve una cookie; salir la invalida. | `auth.test.ts`: «signs in with the registered credentials and invalidates the session on sign-out» |
| Entrar con una contraseña incorrecta o un usuario inexistente es rechazado. | `auth.test.ts`: «rejects a sign-in with a wrong password», «rejects a sign-in with a user that does not exist» |
| `/api/me` sin sesión responde 401. | `auth.test.ts`: «rejects a request to the protected route without a session» |

## Trabajar en un workspace

| Comportamiento | Prueba |
|---|---|
| Invitar o aceptar sin sesión se rechaza. | `workspaces.test.ts`: «rejects inviting and accepting without a session» |
| Crear un workspace adicional deja al creador como propietario. | `workspaces.test.ts`: «creates an additional workspace with the creator as owner» |
| Aceptar una invitación asigna el rol invitado, `autor` o `editor`. | `workspaces.test.ts`: «assigns the invited role when the invitation is accepted», «assigns the editor role when the invitation is accepted» |
| Una invitación caducada ya no se acepta. | `workspaces.test.ts`: «rejects accepting an invitation after it expires» |
| Solo la acepta la cuenta del correo invitado. | `workspaces.test.ts`: «rejects accepting an invitation addressed to another email» |
| No se puede invitar a quien ya es miembro ni invitar sin permisos de administración. | `workspaces.test.ts`: «rejects inviting an email that is already a member», «rejects invitations sent by a member without admin permissions» |
| El workspace personal no se elimina pero sí se renombra; el adicional sí se elimina. | `workspaces.test.ts`: «rejects deleting the personal workspace but allows renaming it», «allows deleting an additional workspace» |
| Un miembro no ve los workspaces ajenos. | `workspaces.test.ts`: «keeps other workspaces invisible to non-members» |
