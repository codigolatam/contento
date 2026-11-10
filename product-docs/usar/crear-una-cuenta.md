# Crear una cuenta y entrar

Las cuentas se crean por la API del servicio. Todavía no hay pantalla de registro ni de inicio de sesión; cuando llegue, esta página se actualizará.

## Crear tu cuenta

Envía una petición `POST` a `/api/auth/sign-up/email` con tu nombre, tu correo y una contraseña:

```sh
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "content-type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"password123"}'
```

El servicio responde con tus datos y una cookie de sesión. Si el correo ya está registrado o falta algún campo, la petición se rechaza.

La cuenta nace con un workspace personal que lleva tu nombre y del que eres propietario. Más detalles en [Trabajar en un workspace](trabajar-en-un-workspace.md).

## Entrar

Envía una petición `POST` a `/api/auth/sign-in/email` con tu correo y tu contraseña:

```sh
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "content-type: application/json" \
  -d '{"email":"ada@example.com","password":"password123"}'
```

El servicio responde con una cookie de sesión. Con una contraseña incorrecta o un correo que no existe, la petición se rechaza.

## Comprobar tu sesión

Envía la cookie de sesión en una petición `GET` a `/api/me`:

```sh
curl http://localhost:3000/api/me -H "cookie: better-auth.session_token=TU_TOKEN"
```

El servicio responde con tu correo. Sin una sesión válida, responde un error 401.

## Salir

Envía una petición `POST` a `/api/auth/sign-out` con tu cookie de sesión. La sesión queda invalidada y `/api/me` vuelve a responder 401.
