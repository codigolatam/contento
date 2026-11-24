# Crear una cuenta y entrar

Las cuentas se crean desde la pantalla de acceso de la aplicación; también puedes usar la API directamente —útil para agentes y automatización—.

## Crear tu cuenta

Abre la dirección de Contento y sigue el enlace **Crear una cuenta**, o ve directamente a `/registro`. La pantalla pide tu nombre, tu correo y una contraseña de mínimo 8 caracteres.

Al enviar, la cuenta queda creada y entras directamente a la aplicación. Si el correo ya está registrado o la contraseña no llega al mínimo, la pantalla lo indica.

La cuenta nace con un workspace personal que lleva tu nombre y del que eres propietario. Más detalles en [Trabajar en un workspace](trabajar-en-un-workspace.md).

## Entrar

Ve a `/login` e introduce tu correo y tu contraseña. Si pediste una sección concreta antes de entrar, la aplicación te devuelve a ella tras el acceso.

Un fallo de entrada muestra «Correo o contraseña incorrectos.» — el mensaje es el mismo si el correo no existe que si la contraseña no coincide, para no revelar cuál de los dos datos falla.

## Comprobar tu sesión

La aplicación comprueba la sesión en cada pantalla: sin sesión válida, las secciones redirigen a `/login`. La sesión viaja en una cookie httpOnly que el navegador envía solo.

Desde la API, envía la cookie de sesión en una petición `GET` a `/api/me`:

```sh
curl http://localhost:3000/api/me -H "cookie: better-auth.session_token=TU_TOKEN"
```

El servicio responde con tu correo. Sin una sesión válida, responde un error 401.

## Salir

Pulsa **Salir** en el encabezado: la sesión queda invalidada y la aplicación vuelve a `/login`.

Desde la API, envía una petición `POST` a `/api/auth/sign-out` con la cookie de sesión.
