# Pantalla de acceso: registro y entrada

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Que una persona pueda crear su cuenta y entrar a Contento desde la interfaz web, sin recurrir a la API. Es prerrequisito de cualquier superficie dirigida a personas —hoy la sesión solo se obtiene por HTTP—, empezando por el pipeline editorial.

## Dependencias

- Ninguna (la fundación ya está en `main`).

## Entrada

- Endpoints de better-auth ya montados en `/api/auth/*` (registro, entrada, cierre de sesión).
- `index.html` con `lang="es"` y la guía de estilo de `DESIGN.md`.

## Resultado esperado

- Ruta `/login` con formulario de correo y contraseña que inicia sesión contra `sign-in/email`.
- Enlace a registro: el mismo acceso permite crear la cuenta (`sign-up/email`), en la misma pantalla o en `/registro`.
- Tras entrar, la sesión viaja en cookie y la aplicación muestra las superficies; sin sesión, las rutas de trabajo redirigen a `/login`.
- Los errores de credenciales se muestran en la propia pantalla sin revelar cuál de los dos datos falla.

## Criterios de calidad

- La pantalla usa solo tokens de `theme.css` para sus valores visuales.
- Los textos de la interfaz están en español; el código y las pruebas en inglés.
- Un fallo de entrada muestra un mensaje genérico (no distingue correo inexistente de contraseña incorrecta).
- La redirección a `/login` sin sesión y el acceso tras registrarse o entrar quedan probados en la suite.

## Procedimiento sugerido

1. Crear la pantalla de acceso y su formulario dentro del router.
2. Llamar a los endpoints de better-auth y gestionar la cookie de sesión.
3. Proteger las rutas de trabajo tras la sesión y redirigir a `/login`.
4. Cubrir la pantalla con pruebas jsdom y la integración con el flujo de auth existente.

## Notas

- Tarea prerrequisito e independiente del pipeline editorial: las puertas de aprobación solo las confirma un actor de sesión.
- El logout puede quedar como detalle mínimo del header si sale gratis; si no, va en una tarea posterior.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
