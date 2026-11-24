# D006: La web consume better-auth a través de su cliente oficial

## Estado

Aceptada

## Contexto

La pantalla de acceso y las guardas de sesión consumían los endpoints de better-auth con `fetch` crudo: URLs como strings, cuerpos armados a mano y códigos de error leídos del payload. Cada consumidor replicaba el protocolo por su cuenta, y esa réplica ya había producido dos defectos que solo la verificación manual con navegador real cazó —un 403 por `Origin` no confiable y un 415 por `content-type` ausente en el cierre de sesión—. La elección de cómo hablar con better-auth se replicaría en cada superficie futura, así que era decisión de arquitectura, no de implementación. Las alternativas eran:

- **`fetch` crudo por consumidor** —el estado anterior—: cero dependencia nueva pero cada llamada reimplementa el contrato; los errores se descubren en el navegador, no en el compilador.
- **Cliente oficial `better-auth/react`** —`createAuthClient` con métodos tipados (`signIn.email`, `signOut`) y el atom de sesión `useSession` que comparte estado, refresca tras cada acción que lo altera y deduplica peticiones—: el protocolo lo mantiene la librería; el precio es adoptar su modelo de estado (nanostores) y sus convenciones de error.
- **Cliente propio fino** —un wrapper con tipos sobre `fetch`—: evita la dependencia pero vuelve a dejar el protocolo en mano del proyecto, que es exactamente lo que falló.

## Decisión

La web habla con better-auth exclusivamente a través de `createAuthClient` de `better-auth/react`, instanciado una vez en `src/web/auth-client.ts`. Las acciones usan sus métodos (`authClient.signIn.email`, `authClient.signUp.email`, `authClient.signOut`) y el estado de sesión se lee con `authClient.useSession()` — `data === null` es anónimo y un fallo de la consulta conserva la última `data`, anónima en el primer acceso—; no hay `fetch` manual contra `/api/auth/*`. El mapeo de errores del producto vive en la superficie: `error.status === 401` son credenciales y `error.code` del cuerpo nombra el motivo. El cliente se configura con `customFetchImpl` que resuelve `globalThis.fetch` perezosamente, porque better-auth captura la referencia al crear el cliente y las pruebas necesitan interceptarla.

`/api/me` permanece como contrato de API para agentes aunque la web ya no lo use.

## Justificación

Los dos defectos que motivaron la decisión eran invisibles para la suite —el servidor cumplía el protocolo y el código compilaba—: solo un navegador real los exponía. Delegar el protocolo al cliente oficial convierte esa clase de error en imposible por construcción, y además regala lo que la arquitectura revisada pedía como mejora C: el atom de sesión compartido elimina la consulta por montaje y propaga los cambios de sesión a todos los consumidores, con lo que las guardas reaccionan por sí solas al alta, la entrada y la salida sin navegación imperativa.

Consecuencias:

- Las pruebas web no stubbean endpoints sino respuestas de `fetch`: el cliente llama con URLs absolutas y objetos `URL`, así que los stubs comparan `pathname`, y como el atom es un nanostore a nivel de módulo que no refirea `onMount` entre pruebas, los stubs fuerzan el refetch con `session.refetch()` tras instalarse —helpers en `src/web/testing/fake-api.ts`.
- La próxima superficie que necesite sesión o acciones de auth usa el mismo `authClient`; crear otro cliente o volver a `fetch` crudo es deriva.
- Las capacidades del cliente que hoy no se usan (verificación, cambio de correo, revocación) quedan disponibles sin decisión nueva.

## Referencias

- `src/web/auth-client.ts`, `src/web/session.tsx`, `src/web/Access.tsx`, `src/web/Layout.tsx`
- `src/web/testing/fake-api.ts`
- `docs/tasks/009-acceso-ui.md`
