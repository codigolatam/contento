# Pantalla de acceso: registro y entrada

## Estado

[x] Completada

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

## Contexto

- Archivos similares:
  - `src/web/routes.tsx` — declara las rutas del SPA con `react-router`; aquí viven la ruta `/login` y la protección de las rutas de trabajo.
  - `src/web/Layout.tsx` — el chrome (encabezado, sidebar, área de contenido); la pantalla de acceso queda fuera de él.
  - `src/web/App.tsx` y `src/web/main.tsx` — montaje de `BrowserRouter` y del root.
  - `src/web/routes.test.tsx` y `src/web/App.test.tsx` — patrón de pruebas web: `@testing-library/react` con `MemoryRouter` y fetch espiado con `vi.spyOn`.
  - `src/server/auth.ts` — `mountAuth` ya expone `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/sign-out` y `/api/me`.
  - `src/server/auth.test.ts` — contrato observable de la auth: cookie `better-auth.session_token`, 401 de `/api/me` sin sesión.
- Patrones:
  - SPA enrutado por el cliente: rutas declaradas una sola vez en `routes.tsx`, comodín `*` que redirige a `/pipeline`.
  - Pruebas web en jsdom con `MemoryRouter`; la red se mockea con `vi.spyOn(globalThis, "fetch")` — `routes.test.tsx` hoy exige que no haya llamadas de red, expectativa que la comprobación de sesión modifica.
  - Cobertura exigida al 100% (líneas, funciones, ramas, sentencias) en `vitest.config.ts`.
  - Todo valor visual sale de los tokens de `theme.css`; los textos de interfaz van en español y el código y las pruebas en inglés.
- Dominio: `docs/domains/001-identidad-y-tenancy.md` — la cuenta accede con correo y contraseña; las operaciones «registrar cuenta, acceder, cerrar sesión» anclan en `mountAuth`. Esta tarea es la primera superficie dirigida a personas que consume la sesión.
- Producto:
  - `product-docs/usar/crear-una-cuenta.md` — declara que el acceso hoy es solo por API y que la página se actualizará cuando exista la pantalla.
  - `product-docs/usar/abrir-la-aplicacion.md` — describe el layout de tres zonas que la persona verá tras entrar.
- PRD: la tarea es suelta, sin conjunto propio; `docs/prd/001-fundacion.md` CU-1 declara el comportamiento de fondo —registro y acceso con correo y contraseña— con el borde de no revelar cuál de los dos datos falla.
- Lecciones:
  - `convenciones-de-codigo` — código, pruebas y mensajes de error en inglés.
  - `pruebas` — suite diseñada con ZOMBIE; lo que depende del servicio real se verifica manualmente fuera de la suite, que mockea `fetch`.
  - `diseno-visual` — valores estéticos razonados por proporción chrome/contenido y validados renderizados con captura.
- Decisiones:
  - `D001` — better-auth ya cubre registro y entrada; la pantalla consume sus endpoints.
  - `D003` — las rutas se declaran en el cliente; `/login` es una ruta más del SPA que el fallback del servidor ya sirve.
  - `D004` — todo valor visual desde tokens; los formularios, botones y errores que la guía aún no describe son laguna suya y se elevan antes de codificar.

## Conectividad

Veredicto: parcialmente conectada.

Todo lo estructural existe: los endpoints `/api/auth/*` con correo y contraseña están montados en `mountAuth` y probados (`auth.test.ts`), `/api/me` distingue sesión de 401, el router cliente declara las rutas en `routes.tsx` y el fallback del servidor ya sirve cualquier ruta de navegación, `index.html` está en español y los tokens viven en `theme.css`.

Lo que falta es absorbible dentro de la tarea:

- El dev server de Vite solo proxifica `/health`; la llamada a `/api/*` desde el SPA en desarrollo exige añadir `/api` al proxy de `vite.config.ts`.
- El registro `sign-up/email` exige `name` además de correo y contraseña; el formulario de alta lo recoge.
- El cliente no puede leer la cookie httpOnly: el estado de sesión se consulta a `/api/me`.
- La guía de estilo no describe campos, botones ni mensajes de error: laguna de `DESIGN.md` que se eleva y materializa en tokens.

## Plan técnico

La web es un SPA React enrutado por `react-router` con las rutas declaradas en `src/web/routes.tsx` bajo un `Layout` que pinta el chrome, y las pruebas corren en jsdom con `fetch` espiado. La sesión ya la sirve el servidor en `/api/auth/*` con cookie httpOnly, y `/api/me` es la única consulta del estado de sesión disponible desde el cliente. El cambio encaja como una ruta pública `/login` fuera del chrome y una guarda que envuelve las rutas de trabajo.

- [x] Elevar a `DESIGN.md` las reglas de campo de formulario, acción primaria (con hover), mensaje de error y contenedor de acceso, y materializar en `theme.css` los tokens que falten.
  - Aporta: D004 exige que todo valor visual salga de tokens y que las decisiones nuevas entren por la guía; la pantalla de acceso es la primera con campos y acción primaria.
  - Contexto: la laguna está declarada en la conectividad; los tokens actuales cubren color, tipografía, espaciado, radio y foco, así que la decisión es de roles de componente —y de medidas como el ancho del contenedor, razonada por proporción y validada renderizada—.
- [x] Añadir `/api` al proxy del dev server de Vite.
  - Aporta: en desarrollo las llamadas del SPA a `/api/*` deben llegar al servidor Hono; en producción ya son same-origin.
  - Contexto: `vite.config.ts` hoy solo proxifica `/health`.
- [x] Crear el módulo de sesión con la consulta a `/api/me` y las guardas de ruta `RequireSession` y `RequireAnon`.
  - Aporta: la cookie es httpOnly y no se lee desde JS; las guardas convierten «con sesión / sin sesión» en una pieza declarativa del router, reutilizable por cualquier superficie futura.
  - Contexto: mientras la comprobación está en vuelo no se renderiza la superficie —el formulario de acceso sí puede mostrarse, es público—; una respuesta no-ok o un fallo de red cuentan como «sin sesión».
- [x] Crear la pantalla de acceso en dos rutas: `/login` para entrar y `/registro` para crear la cuenta.
  - Aporta: cumple «el mismo acceso permite crear la cuenta» declarando cada propósito en su propia ubicación —URL enlazable, encabezado que nombra el propósito y enlaces entre ambas—; el modo elige el endpoint —`sign-in/email` o `sign-up/email`, que además exige nombre—.
  - Contexto: textos en español; el fallo de entrada muestra un mensaje genérico que no distingue correo de contraseña; en el alta se mapean el correo ya registrado y la contraseña corta, y el resto cae al genérico.
- [x] Cablear la navegación posterior al acceso con retorno a la ruta pedida.
  - Aporta: tras entrar o registrarse, la app navega a la ruta que originó la redirección —o a `/pipeline` por defecto—; al montarse la guarda, la comprobación corre de nuevo.
  - Contexto: react-router entrega el origen en `location.state.from`.
- [x] Añadir la acción de salir al encabezado del `Layout`.
  - Aporta: cierra el ciclo de sesión sin pantalla adicional; el POST a `/api/auth/sign-out` seguido de la navegación a `/login` deja que `RequireAnon` revalide.
  - Contexto: las notas de la tarea lo admiten como detalle mínimo «si sale gratis».
- [x] Redeclarar las rutas: `/login` y `/registro` bajo `RequireAnon` y el bloque del `Layout` bajo `RequireSession`.
  - Aporta: la protección se declara una vez y cubre toda superficie presente y futura dentro del layout; el comodín sigue redirigiendo a `/pipeline` y `/login` queda fuera del chrome.
  - Contexto: la redirección recuerda la ruta pedida para el retorno del punto anterior.
- [x] Actualizar las pruebas existentes al mundo con sesión y escribir la suite nueva.
  - Aporta: `routes.test.tsx` y `App.test.tsx` rinden hoy sin red y exigen «sin llamadas»; con guarda necesitan el stub de `/api/me` y la expectativa pasa a ser el estado de sesión.
  - Contexto: el stub de `fetch` es el patrón ya usado (`vi.spyOn`); la cobertura exigida es del 100 %.
- [x] Verificar manualmente el flujo real —alta, entrada, salida y redirección— contra el servidor y capturar la pantalla renderizada.
  - Aporta: la lección de pruebas reserva lo que depende del servicio real a la verificación manual y la de diseño exige evidencia renderizada; el resultado se registra en el archivo de la tarea.
  - Contexto: `npm run dev` con el proxy nuevo y el navegador de las herramientas MCP.

## Suite de pruebas esperada

Casos de uso derivados del objetivo de la tarea y de CU-1 de `docs/prd/001-fundacion.md` (la tarea es suelta): **CU-A** proteger las rutas de trabajo · **CU-B** entrar · **CU-C** crear la cuenta · **CU-D** salir.

- **CU-A** — Sin sesión (`/api/me` responde 401), cada ruta de trabajo (`/`, `/pipeline`, `/series`, `/piezas` y el comodín) redirige a `/login`. (M)
- **CU-A** — Con sesión (`/api/me` responde 200), cada superficie se muestra con su encabezado. (O)
- **CU-A** — Mientras la comprobación está en vuelo, no se muestra ni la superficie ni la pantalla de acceso. (B)
- **CU-A** — Un fallo de red en la comprobación se trata como ausencia de sesión y redirige a `/login`. (E)
- **CU-A** — Con sesión, visitar `/login` o `/registro` redirige a la superficie. (B)
- **CU-A** — La comprobación de sesión consulta `/api/me`. (I)
- **CU-B** — `/login` sin sesión muestra el formulario de correo y contraseña con los textos en español. (O)
- **CU-B** — La entrada válida envía `POST /api/auth/sign-in/email` con cuerpo JSON `{email, password}` y navega a la superficie. (I)
- **CU-B** — La entrada rechazada muestra un único mensaje genérico —el mismo ante correo inexistente y ante contraseña incorrecta— y no navega. (E)
- **CU-B** — Un fallo de red al enviar muestra el mensaje de error y no navega. (E)
- **CU-B** — Enviar el formulario con campos vacíos no realiza la llamada. (B)
- **CU-B** — Tras una redirección, entrar devuelve a la ruta originalmente pedida. (O)
- **CU-B** — Mientras el envío está en vuelo, la acción se deshabilita y su etiqueta declara el proceso. (B)
- **CU-C** — El enlace de alta navega a `/registro`, que muestra el formulario de creación con nombre además de correo y contraseña. (O)
- **CU-C** — El alta válida envía `POST /api/auth/sign-up/email` con cuerpo JSON `{name, email, password}` y navega a la superficie. (I)
- **CU-C** — El alta con correo ya registrado muestra el mensaje de cuenta existente; otro error de alta muestra el mensaje genérico. (E)
- **CU-C** — El alta con contraseña corta muestra el requisito de longitud, declarado también bajo el campo. (E)
- **CU-D** — La acción de salir envía `POST /api/auth/sign-out` y la aplicación queda en `/login`. (O)

## Desviaciones

- La pantalla de acceso se replanificó como dos rutas —`/login` para entrar y `/registro` para crear la cuenta— en lugar del formulario bimodal en `/login` del ítem original. Motivo: la crítica de diseño detectó que un solo formulario no declaraba su propósito —mismo encabezado, misma URL, cambio de modo como estado local sin navegación—; el «Resultado esperado» ya admitía «la misma pantalla o `/registro`», así que el ítem se sustituyó y la expectativa «el enlace conmuta el formulario» quedó como «navega a `/registro`».
- Hallazgos de la crítica de diseño incorporados: estado en curso —botones deshabilitados con etiqueta que declara el proceso—, token `--color-border-field` para la frontera de campos a ≥3:1, encabezado por propósito con la marca relegada a wordmark, error asociado a los campos y re-anunciado en reenvíos, landmark `<main>`, atributos de entrada afinados y requisito de contraseña declarado con mapeo de `PASSWORD_TOO_SHORT`. Las reglas correspondientes entraron en `DESIGN.md`.
- `RequireAnon` muestra el formulario durante la comprobación de sesión. El contexto del plan decía «no se renderiza ni la superficie ni el formulario»; en la pantalla pública el flash en blanco era innecesario y solo `RequireSession` espera, para no filtrar contenido protegido.
- El proxy de Vite reescribe la cabecera `Origin` hacia `:3000`. Hallazgo de la verificación manual: better-auth responde 403 a los POST cuyo `Origin` no está en `trustedOrigins` —el proxy ahora simula el same-origin que tendrá producción—.
- La acción de salir envía `content-type: application/json` con cuerpo `{}`. Hallazgo de la verificación manual: better-auth responde 415 sin esa cabecera y la sesión no se cerraba —`RequireAnon` devolvía al usuario a `/pipeline`—.
- Segunda ronda de crítica de diseño, con permiso para reescribir reglas: el fondo de página pasa a papel real `#f4f1ea` —la tarjeta blanca recupera la separación que la guía promete sin sombras—, la marca se firma en `--font-serif` —excepción ceremonial de la familia reservada al contenido—, el espaciado de superficies escasas se rige por un «ritmo de lectura» por proximidad, `aria-invalid` gana contraparte visual con borde `--color-danger`, el estado en curso declara su relleno `--color-border`, el hover carga más la tinta (`--color-accent-strong: #12304c`), la tarjeta se asienta en el centro óptico (`18vh`) y la secundaria-enlace codifica su subrayado. Las reglas reescritas entraron en `DESIGN.md`.
- La suite usa `.pglite-data-test` como directorio por defecto bajo `NODE_ENV=test` —`resolveDataDir` en `src/server/data-dir.ts`— mientras desarrollo y producción conservan `.pglite-data`. Motivo: el test que ejercita el directorio por defecto competía con el dev server por `.pglite-data` y llegó a corromperlo; ahora la suite nunca toca los datos locales.
- La web deja de hablar con `/api/auth/*` por `fetch` crudo y adopta el cliente oficial `better-auth/react` —decisión registrada en D006—: el estado de sesión vive en el atom compartido de `useSession`, que se refresca solo tras cada acción de auth, así que las guardas reaccionan por sí mismas —`RequireAnon` honra ahora `location.state.from`— y ni `Access` ni `Layout` navegan manualmente. El mapeo de errores del producto se conserva —`status` 401 son credenciales y el `code` del cuerpo nombra el motivo—. El ítem del plan decía «consulta a `/api/me`»: ese endpoint sigue vivo como contrato para agentes, pero la web ya no lo usa. Las pruebas stubbean respuestas de `fetch` comparando por `pathname` —el cliente llama con URLs absolutas y objetos `URL`—, fuerzan el refetch del atom con `session.refetch()` porque nanostores no refirea `onMount` entre pruebas, y lo resetean en `afterEach` —helpers en `src/web/testing/fake-api.ts`—.

## Verificación manual

- Contra `npm run dev` (Hono en `:3000` + Vite en `:5173` con el proxy de `/api`, Firefox por geckodriver): el alta en `/registro` responde 200 con cookie de sesión y aterriza en `/pipeline`; «Salir» envía `sign-out` y deja la aplicación en `/login`; visitar `/piezas` sin sesión redirige a `/login` recordando el origen; la contraseña incorrecta muestra «Correo o contraseña incorrectos.»; la entrada correcta devuelve a `/piezas`.
- Capturas renderizadas revisadas: `01-login-desktop`, `02-registro-desktop`, `03-pipeline-signed-in`, `04-login-error`, `05-piezas-return` y `06-login-narrow` en `/tmp/contento-shots/` —tarjeta centrada de 360px, frontera de campos visible, marca sobre el encabezado del propósito y comportamiento correcto bajo el breakpoint—.
- Segunda ronda de crítica de diseño aplicada y verificada renderizada (`/tmp/contento-shots/r2/`): papel cálido `#f4f1ea` que hace visible la tarjeta, marca en serif como firma de la portada, ritmo por proximidad hacia la acción, celda errada en borde `--color-danger`, estado en curso con relleno `--color-border` declarado y centrado óptico.

## Revisión

- Subagente: 2026-11-23 — Aprueba
- Subagente (refactor del cliente de auth): 2026-11-24 — Aprueba
- Usuario (ejecución): 2026-11-24 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
