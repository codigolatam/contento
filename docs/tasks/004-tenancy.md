# Workspaces, roles e invitaciones

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Establecer el workspace como frontera de tenant mediante el plugin de organizaciones de better-auth, con los roles autor y editor e invitaciones por correo.

## Dependencias

- 003

## Entrada

- Tarea 003 completada.

## Resultado esperado

- Creación de workspaces por usuarios autenticados.
- Invitación de miembros por correo, con expiración y aceptación.
- Asignación de los roles autor y editor dentro de un workspace.
- Al registrarse, cada usuario recibe un workspace personal con su nombre, del que es propietario y que no puede eliminarse.

## Criterios de calidad

- Un usuario recién registrado tiene exactamente un workspace personal, con su nombre y con él como `owner`. La creación del workspace forma parte del registro: si falla, el registro no se completa.
- El workspace personal no puede eliminarse.
- Los roles autor y editor se definen con control de acceso. Los roles por defecto `owner`, `admin` y `member` administran la organización.
- Una invitación caduca y no se puede aceptar después.
- Un miembro de un workspace no puede leer datos de otro workspace.
- Los permisos de cada rol quedan documentados en el código.

## Procedimiento sugerido

1. Definir los statements y los roles autor y editor con control de acceso.
2. Activar el plugin de organizaciones con esos roles.
3. Crear el workspace personal en el hook de registro de usuarios de better-auth, dentro del mismo registro.
4. Implementar la invitación y su aceptación.
5. Probar el aislamiento entre workspaces, la caducidad de invitaciones y la creación del workspace personal al registrarse.

## Notas

- Lo que cada rol puede hacer sobre piezas y briefs se fija en las propuestas 002 y 003. Aquí solo se definen los roles y sus permisos sobre la organización.

## Contexto

- Archivos similares: `src/server/auth.ts` (`createAuth` recibe la conexión, la instancia `auth` exportada sirve al CLI y `mountAuth` monta `/api/auth/*` y `/api/me`); `src/server/database.ts` (conexión y migraciones inyectables); `src/server/schema.ts` (esquema generado por el CLI, que esta tarea regenera con las tablas del plugin).
- Patrones: TypeScript estricto; código, identificadores, nombres de pruebas y mensajes en inglés; sin comentarios; aserciones precisas; aislamiento con `vi.stubEnv` y limpieza en `afterEach`; cobertura del 100 %; las verificaciones con servicios externos se hacen manualmente, fuera de la suite.
- Dominio: `docs/domains/001-identidad-y-tenancy.md` marca workspace, workspace personal, rol e invitación como pendientes de ancla; sus invariantes (un workspace personal por cuenta, no eliminable, renombrable, aislamiento entre workspaces, invitación caducada no aceptable) son los criterios de esta tarea.
- Producto: las operaciones nuevas solo existen por API; el sensor de producto del cierre decidirá qué documentar en `product-docs/`.
- PRD: `docs/prd/001-fundacion.md`, CU-2 (workspace adicional), CU-3 (invitar con rol autor o editor, borde de invitación caducada) y CU-5 (workspace personal con su nombre, renombrable, no eliminable, creado dentro del registro).
- Lecciones: `docs/lessons/convenciones-de-codigo.md` y `docs/lessons/pruebas.md` (ZOMBIE y verificación externa fuera de la suite, que esta tarea aplica a Postgres).
- Decisiones: D001 (los roles de dominio se definen con el control de acceso de better-auth) y D002 (un único esquema `pg-core`; la migración corre igual en PGlite y en Postgres).
- Investigación técnica en el código instalado de better-auth 1.7.14:
  - `sign-up/email` corre dentro de `runWithTransaction`, y el adaptador Drizzle solo implementa transacción real con `transaction: true`; sin ella, `getBaseAdapter` lo parchea con un no-op y no hay atomicidad.
  - Los hooks `create.after` de `databaseHooks` se encolan con `queueAfterTransactionHook` y corren tras el commit: un fallo dejaría el usuario creado sin workspace.
  - Los hooks `create.before` corren dentro de la transacción. `user.create.before` es demasiado pronto (la FK de `member.userId` exige que el usuario exista); `account.create.before` se dispara en `linkAccount`, tras el insert del usuario y dentro de la misma transacción.
  - `getCurrentAdapter` es export público de `better-auth` y dentro del hook devuelve el adaptador de la transacción; el `db` de Drizzle propio no se uniría a la transacción en Postgres por usar otra conexión del pool.

## Conectividad

- Veredicto: conectada.
- Justificación: la tarea 003 completada deja `createAuth` y `mountAuth` como punto único donde añadir el plugin `organization` y los hooks. Las dependencias ya están instaladas (`better-auth@1.7.14` y `auth@1.7.14`); no hacen falta paquetes nuevos. El CLI regenera `schema.ts` y `drizzle-kit` emite la siguiente migración sobre la infraestructura de la tarea 002.

## Plan técnico

- [x] Configurar el adaptador con `transaction: true` y activar el plugin `organization` en `createAuth`, con `createAccessControl` y los roles `autor` y `editor`.
  - Aporta: transacciones reales (sin ella no hay atomicidad posible) y los roles de dominio; `owner`, `admin` y `member` quedan administrando la organización, `autor` y `editor` sin permisos de administración.
- [x] Añadir el campo `personal` (booleano) a `organization` con `schema.additionalFields` del plugin, y bloquear el borrado cuando `personal` sea `true` con `organizationHooks.beforeDeleteOrganization` lanzando `APIError`.
  - Aporta: el invariante «el workspace personal no se elimina» y la marca que lo distingue de los adicionales, que sí se pueden borrar y renombrar.
- [x] Crear el workspace personal en `databaseHooks.account.create.before`: dentro de la transacción del registro (el usuario ya existe en ese punto), usando `getCurrentAdapter()` para insertar `organization` y `member` con rol `owner`; nombre del usuario como nombre y slug único derivado del id de usuario.
  - Aporta: la atomicidad que exige el criterio: si la creación falla, la excepción revierte todo el registro. Un guard (si ya tiene workspace personal) lo mantiene idempotente para cuentas futuras vinculadas.
- [x] Regenerar `schema.ts` con `npx auth generate`, revisar el diff y emitir la migración con `drizzle-kit generate`.
  - Aporta: las tablas `organization`, `member`, `invitation` (y las que el CLI emita) sin escribir el esquema a mano.
- [x] Montar invitaciones por API: los endpoints del plugin ya quedan bajo `/api/auth/*`; `invitationExpiresIn` configurable. Sin envío de correo real (no hay mailer): la invitación se crea dirigida a un correo y el invitado la acepta autenticado.
  - Aporta: CU-3 completo por API, sin meter un servicio externo al alcance.
- [x] Extraer la creación del workspace personal a una función inyectable (`createAuth(database, overrides?)`) para probar el rollback con un fallo real.
  - Aporta: la prueba del invariante sin depender de provocar errores internos.
- [x] Verificar el flujo completo contra Postgres 15 real durante la tarea; no queda en la suite.
  - Aporta: el criterio de producción (D002) sin acoplar la suite.

## Suite de pruebas esperada

- Registro sin campos requeridos sigue rechazado; invitar y aceptar sin sesión se rechazan. (Z, CU-1/CU-3)
- Al registrarse, el usuario tiene exactamente un workspace personal con su nombre, marcado `personal`, y su membresía `owner`. (O, CU-5)
- Un usuario crea un workspace adicional y queda `owner`; invita con rol `autor` y con `editor` y al aceptar la membresía tiene ese rol. (M, CU-2/CU-3)
- Una invitación con `expiresAt` en el pasado no se puede aceptar; el workspace personal no se puede borrar pero sí renombrar; un workspace adicional sí se puede borrar. (B, CU-3/CU-5)
- Si la creación del workspace personal falla, el registro responde error y no queda fila del usuario; invitar a un correo ya miembro se rechaza. (E, CU-5)
- Un miembro de un workspace no puede leer otro workspace (`get-full-organization` ajeno es rechazado); `listOrganizations` solo devuelve los propios. (I, invariante de aislamiento)
- Regresión: tipado, linter y pruebas con cobertura del 100 %.
- Durante la tarea, registro con workspace personal, creación, invitación y aceptación pasan contra Postgres 15 real. Verificación manual, no queda en la suite.

## Desviaciones

- El workspace personal se crea en `databaseHooks.account.create.before`, no en un hook de creación de usuario como sugiere el procedimiento. La verificación en el código de better-auth 1.7.14 muestra que los hooks `create.after` se encolan con `queueAfterTransactionHook` y corren tras el commit, mientras que los `create.before` corren dentro de la transacción; `account.create.before` (disparado por `linkAccount`) es el primer punto donde el usuario ya existe dentro de ella. Las escrituras usan `getCurrentAdapter` (export público) sobre `instance.$context` para quedarse en la transacción.
- `drizzleAdapter` recibe `transaction: true`: sin ella `getBaseAdapter` parchea `adapter.transaction` con un no-op y el registro no tendría atomicidad.
- La opción `roles` del plugin sustituye a `defaultRoles`, así que la configuración expande `...defaultRoles` y añade `autor` y `editor` con permisos de nivel miembro (los `owner`, `admin` y `member` por defecto administran la organización).
- El slug del workspace personal es `personal-<userId>`: único por construcción e insensible a nombres repetidos.
- `personal` se declara como `additionalField` con `input: false` para que la API no pueda crear ni convertir workspaces personales; el borrado se bloquea en `organizationHooks.beforeDeleteOrganization`.
- No se envía correo de invitación (no hay mailer); el envío queda pendiente por decisión del usuario. `invitationExpiresIn` queda en el valor por defecto del plugin (48 h); la caducidad se prueba actualizando `expires_at` directamente.
- `createAuth` acepta `overrides` con `createPersonalWorkspace` inyectable para probar el rollback con un fallo real.
- `organization.metadata` se mantiene aunque no tiene uso: se evaluó eliminarla por petición del usuario, pero el plugin la declara campo núcleo del modelo `organization` y su validación de esquema en tiempo de ejecución exige la columna —quitarla obligaba a `advanced.database.validateSchema: false`, que desactiva la comprobación para todo el esquema—, así que el usuario decidió conservarla (commit revertido).

## Verificación manual

- Contra Postgres 15 (imagen `postgres:15-alpine` local, contenedor efímero eliminado tras la prueba): el registro crea el workspace personal con `personal = true` y membresía `owner`; `organization/create` crea un workspace adicional (`personal = false`); `invite-member` con rol `autor` y `accept-invitation` dejan la membresía con rol `autor`; `organization/delete` sobre el personal responde `personal workspaces cannot be deleted`. Las tablas `organization`, `member` e `invitation` existen tras la migración.

## Revisión

- Subagente: 2026-11-09 — Aprueba
- Usuario (ejecución): 2026-11-09 — Aprueba
- Usuario (cierre): 2026-11-09 — Aprueba
