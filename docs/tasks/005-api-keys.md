# Claves de API por agente

## Estado

[r] En revisión

## Tipo

desarrollo

## Objetivo

Dar identidad propia a cada agente mediante claves de API de better-auth, con permisos por clave y ligadas a un workspace.

## Dependencias

- 004

## Entrada

- Tarea 004 completada.

## Resultado esperado

- Crear, listar, verificar y eliminar claves de API de un workspace.
- Cada clave lleva sus propios permisos.

## Criterios de calidad

- Una clave válida devuelve su workspace y sus permisos.
- Una clave eliminada o caducada no se verifica.
- Un rol sin el permiso `apiKey` no puede crear claves.
- Las claves son de organización, no de usuario.

## Procedimiento sugerido

1. Activar el plugin de API keys con `references: "organization"`.
2. Configurar el permiso `apiKey` en los roles que lo necesiten.
3. Probar creación, verificación, caducidad y eliminación.

## Notas

- El uso de estas claves por el servidor MCP queda para la propuesta 004.

## Contexto

- Archivos similares: `src/server/auth.ts` (`createAuth` recibe la conexión, declara `ac` con `createAccessControl` y el mapa `roles`, monta los plugins); `src/server/schema.ts` (generado por el CLI, se regenera con las tablas del plugin); `src/server/workspaces.test.ts` (patrón de pruebas de endpoints `/api/auth/*` con sesiones por cookie); `src/server/database.ts` (conexión inyectable).
- Patrones: TypeScript estricto; código, identificadores, nombres de pruebas y mensajes en inglés; sin comentarios; aserciones precisas; aislamiento con base PGlite fresca por prueba y cierre en `afterEach`; cobertura del 100 %; esquema regenerado con `npx auth generate` y migración con `drizzle-kit generate` (nueva migración: la `0001` ya está fusionada); verificación con Postgres real manual, fuera de la suite.
- Dominio: `docs/domains/001-identidad-y-tenancy.md` declara «Clave de agente» —credencial de API ligada a un workspace, con permisos propios— y su invariante (una clave pertenece a un workspace y solo tiene los permisos concedidos) como pendientes de ancla en esta tarea.
- Producto: ninguna guía de `product-docs/` cubre claves; el sensor de producto del cierre decidirá qué documentar.
- PRD: `docs/prd/001-fundacion.md`, CU-4 (un propietario o administrador crea una clave de API para el workspace con sus permisos; borde: una clave eliminada o caducada deja de funcionar).
- Lecciones: `docs/lessons/convenciones-de-codigo.md`, `docs/lessons/pruebas.md` (ZOMBIE y verificación externa fuera de la suite) y `docs/lessons/documentacion-de-producto.md`.
- Decisiones: D001 (los roles de dominio con el control de acceso de better-auth) y D002 (un único esquema `pg-core`, PGlite en desarrollo y pruebas).
- Investigación técnica en `@better-auth/api-key@1.7.14` (paquete separado desde better-auth 1.7.x; peer `better-auth ^1.7.14`, casa con la versión instalada):
  - El plugin `apiKey` no está dentro de `better-auth`: se importa de `@better-auth/api-key`, dependencia nueva.
  - `references: "organization"` hace que `referenceId` sea el `organizationId`: la clave es del workspace, no del usuario.
  - Endpoints `/api/auth/api-key/{create,verify,get,list,update,delete}`; `verify` toma la clave en el cuerpo sin sesión (es como el agente se autentica).
  - La autorización corre por `checkOrgApiKeyPermission`: exige membresía en la organización y llama a `hasPermission` del plugin `organization` con `permissions: { apiKey: [acción] }` (`create`, `read`, `update`, `delete`), con `allowCreatorAllPermissions` para el propietario.
  - `defaultStatements` no incluye `apiKey`: hay que extender el `ac` con `apiKey: ["create", "read", "update", "delete"]` y dar el permiso solo a los roles que lo necesiten; sin la extensión `hasPermission` falla y todo rol queda rechazado.

## Conectividad

- Veredicto: parcialmente conectada.
- Justificación: `createAuth` quedó como punto único de plugins tras la tarea 004, con `ac`, `roles` y el plugin `organization` activo —la base que `checkOrgApiKeyPermission` necesita para resolver membresía y permisos—; la regeneración de esquema y la infraestructura de migraciones existen. Lo que falta es el propio plugin, que en better-auth 1.7.x vive en el paquete separado `@better-auth/api-key`: falta absorbible dentro de la tarea instalando `@better-auth/api-key@1.7.14`, cuya peer dependency `better-auth ^1.7.14` casa exacta con la versión instalada.

## Plan técnico

`src/server/auth.ts` concentra toda la configuración de better-auth: `createAuth` declara `ac` con `createAccessControl`, el mapa `roles`, la lista `plugins` y `databaseHooks`. El esquema `src/server/schema.ts` se regenera con `npx auth generate` y `drizzle-kit` emite la migración. Las pruebas siguen el patrón de `src/server/workspaces.test.ts`: base PGlite fresca por prueba, `mountAuth` sobre Hono y sesiones por cookie.

- [x] Instalar `@better-auth/api-key@1.7.14` como dependencia.
  - Aporta: el plugin no forma parte de `better-auth` en 1.7.x —vive en paquete propio—; su peer dependency `better-auth ^1.7.14` casa exacta con la versión instalada.
- [x] Extender `ac` con el recurso `apiKey: ["create", "read", "update", "delete"]` y reasignar los roles.
  - Aporta: `checkOrgApiKeyPermission` llama a `hasPermission` con `{apiKey: [acción]}`; sin el statement toda petición se rechaza. `owner` queda cubierto por `allowCreatorAllPermissions`; `admin` se redefine con `ac.newRole` replicando los permisos de `adminAc` más `apiKey` completo (CU-4: propietario o administrador); `member`, `autor` y `editor` declaran `apiKey: []` explícito.
  - Contexto: `defaultRoles.admin` no se puede reusar verbatim —sus statements no conocen `apiKey` y `authorize` fallaría—; los statements exactos de `adminAc` están en `node_modules/better-auth/dist/plugins/organization/access/statement.d.mts`. Desviación a registrar.
- [x] Activar `apiKey({ references: "organization" })` en la lista `plugins` de `createAuth`.
  - Aporta: las claves quedan ligadas al workspace (`referenceId` es el `organizationId`: claves de organización, no de usuario) y nacen los endpoints `/api/auth/api-key/*`.
  - Contexto: `verify` toma la clave en el cuerpo sin sesión —es como el agente se autentica—; `create` exige `organizationId` y membresía con el permiso.
- [x] Regenerar `schema.ts` con `npx auth generate` y emitir la migración con `drizzle-kit generate`.
  - Aporta: la tabla `apikey` ligada a la organización por `referenceId` sin escribir el esquema a mano.
  - Contexto: la `0001` ya está fusionada —la migración nueva es la `0002` de la serie.
- [x] Verificar el flujo completo contra Postgres 15 real durante la tarea; no queda en la suite.
  - Aporta: el criterio de producción (D002) sin acoplar la suite.

## Suite de pruebas esperada

- Crear una clave sin sesión se rechaza; crear sin `organizationId` se rechaza. (Z, CU-4)
- Un propietario crea una clave en su workspace; verificarla devuelve el workspace y los permisos de la clave. (O, CU-4)
- Un administrador también crea; `list` devuelve las claves del workspace. (M, CU-4)
- Una clave con `expiresAt` en el pasado no se verifica; una eliminada tampoco. (B, CU-4)
- `member`, `autor` y `editor` no pueden crear claves; un miembro de otro workspace no puede crear una clave para él. (E, CU-4)
- Las claves son de la organización: `list` solo devuelve las del workspace indicado; `verify` no requiere sesión. (I, invariante)
- Una clave verifica sin límite de tasa: el rate limit del plugin queda desactivado. (B, CU-4)
- Eliminar un workspace invalida sus claves. (B, invariante)
- Regresión: tipado, linter y pruebas con cobertura del 100 %.
- Durante la tarea, crear, listar, verificar y eliminar una clave pasan contra Postgres 15 real. Verificación manual, no queda en la suite.

## Desviaciones

- La instalación fijó `better-auth` a `1.7.14` exacto (era `^1.7.14`) y añadió `@better-auth/core@1.7.14` y `better-call@1.4.4` como dependencias explícitas. Motivo: al resolver, npm flota las peer dependencies a la más nueva compatible —`@better-auth/core@1.7.19`, que exige `better-call@1.4.5`— y rompe el peer exacto `better-call@1.4.4` del plugin. Decisión: fijar las cuatro piezas para preservar la pila verificada en la tarea 004; además evita subidas sorpresa del stack.
- `admin` y `member` se redefinieron con `ac.newRole` en lugar de reusar `defaultRoles`. Motivo: los roles por defecto se construyeron con el `ac` original, que no declara el recurso `apiKey`, y `authorize` rechaza recursos que el rol no conoce. Decisión: replicar los statements de `adminAc`/`memberAc` añadiendo `apiKey` (completo en `admin`, vacío en `member`), como anticipó el plan.
- Los permisos de la clave son server-only: `api-key/create` rechaza `permissions` (además de `refill`, `rateLimit*` y `remaining`) en peticiones de cliente con `SERVER_ONLY_PROPERTY`; solo `auth.api.createApiKey` los acepta. Motivo: es un contrato del plugin, no configurable. Decisión: la expectativa «cada clave lleva sus propios permisos» se cubre creando la clave con permisos vía `auth.api` y comprobando que `verify` los devuelve; la suite además fija que el HTTP los rechaza.
- `api-key/verify` no se enruta por HTTP: el endpoint está marcado `SERVER_ONLY` y el router lo omite; la única vía es `auth.api.verifyApiKey`, que es la que usará el servidor MCP. La suite lo fija: el POST responde error y `verify` funciona sin sesión.
- Se desactivó el rate limit de verificación (`rateLimit: { enabled: false }`). Motivo: el plugin aplica por defecto 10 verificaciones por 24 h a cada clave —detectado en la revisión—, incompatible con una credencial de agente que se verifica en cada petición; `rateLimit*` además es server-only, así que la decisión vive en la configuración. Decisión: desactivarlo; si hace falta límite, se reintroduce como configuración deliberada.
- El hook de borrado elimina las claves del workspace. Motivo: `apikey.referenceId` es polimórfico (usuario u organización), así que la tabla no puede tener FK y la revisión detectó que borrar un workspace dejaba claves huérfanas que seguían verificando. Decisión: `beforeDeleteOrganization` borra las claves del workspace en la misma petición, antes de que la organización se elimine —la semántica de cascada que daría la FK si existiera—; el personal sigue protegido antes de cualquier borrado y la cascada falla cerrado si el hook llega sin contexto.
- El CLI `auth` también quedó fijado a `1.7.14` tras la revisión, por coherencia con la pila fijada.

## Verificación manual

- Contra Postgres 15 (imagen `postgres:15-alpine` local, contenedor efímero eliminado tras la prueba): el registro crea el workspace personal con membresía `owner`; `api-key/create` con una `Origin` válida devuelve la clave con `referenceId` igual al workspace; `verifyApiKey` la valida; `list` la devuelve; `delete` la elimina y la verificación posterior responde `INVALID_API_KEY`. La tabla `apikey` existe tras aplicar la migración `0002`.
- Fuera de `NODE_ENV=test`, los POST exigen una cabecera `Origin` que case con `baseURL` —es el guarda CSRF de better-auth (`skipOriginCheck` solo se desactiva en entorno de prueba)—. La suite no lo ejercita; quedó confirmado en la verificación manual.

## Revisión

- Subagente: 2026-11-10 — Aprueba
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
