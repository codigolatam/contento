# Modelo y API del pipeline editorial

## Estado

[r] En revisión

## Tipo

desarrollo

## Objetivo

El cimiento del pipeline, solo servidor: la resolución del actor
—sesión o clave de API hacia workspace— que hoy no existe, el
montaje de rutas de dominio sobre la base de datos, el modelo de
piezas, los documentos `recurso` y sus enlaces, y la primera
puerta humana. Toda superficie posterior consume esta API.

## Dependencias

- Ninguna de tareas: la resolución de actor usa `session`,
  `member` y `apikey` de la fundación.

## Entrada

- Esquema drizzle actual (`src/server/schema.ts`) con `event`,
  `member`, `session`, `apikey`.
- La propuesta, sección Solución: estados, primera puerta,
  recursos, permisos.
- `recordEvent`/`listEvents` de `events.ts` a nivel base de
  datos; `createApp` sin acceso a DB hoy.

## Resultado esperado

- Resolución de actor: un middleware o utilidad compartida que
  identifica al actor —persona por sesión o agente por clave de
  API— y el workspace al que se aplica la petición; todas las
  rutas de dominio se montan sobre ella.
- Modelo: `pieza` (workspace, estado, tema, pregunta del lector,
  ángulo, campos congelados), `documento` (workspace, tipo,
  título, cuerpo, congelado) y el enlace pieza↔recurso.
  El enum de estados incluye `descartada` desde el principio
  aunque aún sea inalcanzable.
- API: crear pieza con `topic` obligatorio (nace en `propuesta`),
  editar campos antes de congelar —sin dejar el tema vacío—, crear
  recurso, ligar, desligar y borrar, y la
  transición `aprobar` —que verifica los cuatro requisitos,
  enumera los faltantes, congela los campos y registra el evento
  con el actor—.
- El alta de la pieza y cada transición registran su evento con
  el actor.
- Permisos en el servidor: `aprobar` exige actor de sesión
  (cualquier miembro; `403` a clave de API); desligar o borrar
  recursos de una pieza aprobada también. Ligar sigue libre tras
  la puerta; todo lo demás lo puede hacer el agente.
- Endpoints de lectura que la interfaz necesitará: listado de
  piezas con su madurez `n/4` calculada en el servidor y detalle
  de pieza con sus recursos.

## Criterios de calidad

- La puerta enumera los requisitos faltantes.
- Los campos congelados rechazan escritura por API.
- Cada `403` de clave de API —aprobar y quitar soporte de pieza
  aprobada— queda cubierto en la suite.
- La madurez `n/4` la calcula el servidor.

## Procedimiento sugerido

1. Resolución de actor (sesión/clave → workspace) y montaje de
   rutas de dominio con acceso a la base de datos.
2. Esquema y migración de `pieza`, `documento` y el enlace.
3. API de piezas, recursos y enlaces con la frontera sesión/clave
   y el registro del evento de aprobación.
4. Suite: la puerta completa, los `403`, la congelación y el
   `n/4` servido.

## Notas

- La entidad `documento` nace aquí; la propuesta 003 la expande
  con versionado —declararlo en el diseño de la tabla evita
  duplicarla después.
- La resolución del workspace para una persona en sesión usa el
  mecanismo que el servidor ya ofrece (`activeOrganizationId` o
  equivalente); fijar la elección en el plan técnico de la tarea.

## Contexto

- **Archivos similares:**
  - `src/server/schema.ts` — tablas pg-core existentes (`event`, `apikey`, `member`); modelo para `pieza`, `documento` y el enlace.
  - `src/server/events.ts` — `recordEvent`/`listEvents` sobre un `DbHandle` acotado; patrón de módulo de dominio y primera consumidora del registro.
  - `src/server/app.ts` y `src/server/auth.ts` — `createApp` no tiene acceso a la base de datos hoy; `mountAuth` muestra el patrón de montaje de rutas bajo `/api`.
  - `src/server/api-keys.test.ts` — patrón de suite de integración HTTP: `createDatabase("")` + migración + `createApp` + `mountAuth` por caso, con helpers `signup`, `sessionCookie`, `createKey`, `verifyKey`.
- **Patrones:**
  - Los módulos de dominio exportan funciones sobre un handle acotado (`Pick<Database, …>`), no sobre la conexión completa.
  - Los endpoints nuevos viven bajo `/api` — el fallback SPA sombrea toda GET fuera de `/api`.
  - `recordEvent` acepta el handle transaccional para confirmar evento y cambio juntos.
- **Dominio:**
  - `docs/domains/001-identidad-y-tenancy.md` — el workspace es la frontera de tenant; la clave de agente liga `referenceId` al workspace; el evento es append-only y esta tarea es su primer consumidor real.
- **Producto:** ninguna aplica directamente — la API es de servidor; las superficies llegan en las tareas 013 y 014.
- **PRD:** `docs/prd/002-pipeline-editorial.md` — CU-1 (crear pieza, nace en `propuesta`), CU-2 (maduración con `n/4` y enumeración de faltantes), CU-3 (aprobar solo con sesión; congela tema, pregunta y ángulo), CU-9 (recursos: crearlos y ligarlos libre; desligar o borrar en pieza aprobada exige sesión; borrar elimina documento y enlaces).
- **Lecciones:**
  - `pruebas.md` — diseño ZOMBIE, 100% de cobertura en la entrega, verificaciones con servicios externos fuera de la suite.
  - `convenciones-de-codigo.md` — código, pruebas y mensajes de error en inglés.
- **Decisiones:**
  - D001 — stack Hono + Drizzle + better-auth.
  - D002 — un único esquema pg-core; PGlite en desarrollo y pruebas.
  - D003 — los endpoints nuevos viven bajo `/api`.
  - D005 — una única entidad `documento` con `tipo` (`recurso`, `borrador`) que gobierna su ciclo; diseñar la tabla pensando en el versionado de la propuesta 003.
- **Épica:** `docs/epics/002-pipeline-editorial.md` — decisiones transversales ya tomadas: la resolución de actor nace aquí como infraestructura compartida, el enum incluye `descartada` desde el principio, el `n/4` lo calcula el servidor, las puertas exigen actor de sesión y el alta más cada transición registran evento con actor.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe en el codebase:

- `session` (con `activeOrganizationId`), `member` y `apikey` están en `src/server/schema.ts`; `verifyApiKey` devuelve `referenceId` ligada al workspace (verificado en `api-keys.test.ts`).
- `recordEvent`/`listEvents` existen a nivel base de datos en `src/server/events.ts`.
- `createApp` no recibe la base de datos hoy —montar las rutas de dominio sobre ella es el propio alcance de la tarea, no una capacidad faltante—.
- `drizzle.config.ts` apunta a `src/server/schema.ts`; la migración nueva se genera con drizzle-kit como las cuatro existentes.

## Plan técnico

El servidor es Hono con rutas montadas sobre la app (`mountAuth` es el patrón: cada módulo recibe sus dependencias y registra endpoints bajo `/api`). La persistencia es drizzle/pg-core con migraciones de drizzle-kit y PGlite en desarrollo y pruebas; `recordEvent`/`listEvents` ya existen a nivel base de datos y aceptan el handle transaccional. La tarea añade el primer dominio de negocio: resolución de actor → workspace, modelo pieza/documento/enlace y la API del pipeline.

Decisiones transversales del plan:

- **Vocabulario en inglés, dominio en español:** estados `proposal`, `idea_approved`, `drafting`, `ready`, `discarded`; tipos `resource`, `draft` (abierto a `brief`, `style_guide` sin migración — columna `text` + unión en código). Eventos `piece.created`, `piece.approved`. La UI traduce a las etiquetas del PRD.
- **Cardinalidad en código, no en constraints:** todo vínculo pieza↔documento es una fila de `piece_document`; el «un borrador por pieza» lo garantiza la transacción de `empezar_redaccion` (011), que de todos modos debe comprobarlo para ser idempotente. Escape hatch documentado: columna `role` o `piece_id` si se quisiera backstop después.
- **Requisitos como lista declarativa:** `REQUIREMENTS` en código — cada entrada declara cómo se satisface; `n/4` y `missing[]` se derivan. Un quinto requisito futuro es una entrada, no una migración.
- **Congelación con evidencia:** `fields_frozen` booleano (012 lo descongela); el evento `piece.approved` lleva en `data` el snapshot de los campos aprobados.
- **Estado en tablas, historia en eventos:** `piece`/`document` no llevan `created_by`; la autoría vive en `event.actor` con formato `user:{id}`/`api-key:{id}` del que `actor.ts` es el único dueño.

- [x] Esquema `piece`, `document` y `piece_document` + migración generada con drizzle-kit
  - Aporta: persiste el modelo del pipeline; `PIECE_STATUSES` completo desde el inicio (incluida `discarded`, inalcanzable) y `DOCUMENT_TYPES` extensible sin migración; `piece_document` es el único mecanismo de vínculo pieza↔documento, uniforme para recurso, borrador y brief futuros.
  - Contexto: `piece` lleva `workspace_id`, `status`, `topic`, `reader_question`, `angle`, `fields_frozen` y timestamps, con índice `(workspace_id, status)`; `document` lleva `workspace_id`, `type`, `title`, `body`, `frozen` y timestamps, con índice `(workspace_id, type)`; `piece_document` es PK `(piece_id, document_id)` con `created_at` e índice en `document_id` para «piezas que sostiene este recurso»; nombres en inglés, FKs con `onDelete: cascade`.
- [x] `src/server/actor.ts`: resolución de actor y guard de sesión
  - Aporta: la frontera sesión/clave y el tenant se deciden en un solo lugar; todas las rutas de dominio heredan actor + workspace y el `403` a clave es reusable.
  - Contexto: sin `activeOrganizationId` válido, el workspace es el personal del propio usuario —la asociación estable es `user.personalWorkspaceId` —puntero inmutable escrito al crear la cuenta y rellenado en la migración para cuentas previas por titularidad verificada (membresía `owner` + slug original, o un único espacio `personal` en propiedad)—, no el slug (renombrable) ni cualquier membresía en una organización `personal` (un usuario puede ser invitado al espacio personal de otro)—; el campo también lo pueblan `organization/create` y `organization/accept-invitation` además de `set-active`; la clave llega por la cabecera `x-api-key` y se verifica con `auth.api.verifyApiKey` (`referenceId` = workspace); la sesión tiene prioridad si llegan ambas; el actor para eventos es `user:{userId}`/`api-key:{keyId}`.
- [x] `src/server/pieces.ts`: operaciones de dominio sobre `DbHandle`
  - Aporta: la lógica de la puerta, la madurez y las reglas de recursos queda pura y testeable, reutilizable por las tareas 011, 012 y 013; `approvePiece` confirma cambio + evento en una transacción.
  - Contexto: «pieza aprobada» para la regla de soporte es `status !== 'proposal'`; solo documentos `type='resource'` son ligables por API; `recordEvent` ya acepta el handle transaccional.
- [x] `src/server/pipeline.ts` + wiring: rutas bajo `/api` montadas con `mountPipeline(app, { db, auth })` paralelo a `mountAuth`, conectado en `server.ts`
  - Aporta: la API consumible por la interfaz (014) y por agentes queda publicada; los errores son JSON `{ error, ... }` con 400 validación, 401 sin actor, 403 clave en puerta humana, 404 recurso de otro workspace y 409 congelado o requisitos faltantes.
  - Contexto: `createApp` sigue sin acceso a la base de datos; `GET /api/pieces` sirve `maturity` por pieza; `GET /api/pieces/:id` devuelve pieza + documentos ligados + `missing[]` + `maturity`; `POST /api/documents` acepta `pieceIds` para nacer ligado; `GET /api/documents` lista los recursos del workspace con sus piezas.
- [x] Suite completa y gates (eslint, typecheck, cobertura 100%)

## Suite de pruebas esperada

**Resolución de actor (infraestructura):**

- Una petición sin sesión ni clave a cualquier ruta de dominio responde 401 (Z)
- Una sesión resuelve el workspace personal y sus datos quedan aislados de otros workspaces (O, I)
- Una sesión con `activeOrganizationId` de un workspace donde es miembro opera sobre ese workspace (B)
- Una clave de API válida resuelve el workspace de su `referenceId` y opera como agente (I)
- Una clave inválida o expirada responde 401 (E)
- Con sesión y clave a la vez, la sesión tiene prioridad (B)

**CU-1 — Crear pieza:**

- Crear pieza con sesión → 201, `status: proposal`, `topic` persistido y evento `piece.created` con actor `user:{id}` (O)
- Crear pieza sin `topic` usable → 400 (B)
- Crear pieza con clave → mismo resultado con actor `api-key:{id}` (I)
- Crear con campos iniciales → persisten (I)
- Listar un workspace sin piezas → `[]` (Z)

**CU-2 — Madurar la idea:**

- Editar campos antes de congelar → 200 y la madurez crece (O)
- La madurez cuenta tema + pregunta del lector + ángulo + al menos un recurso: progresa 1→2→3→4 desde el alta (M, B)
- Editar campos de una pieza congelada → 409 sin cambio (B)
- El detalle devuelve `missing[]` con lo que falta para la puerta (I)

**CU-3 — Aprobar la idea:**

- Aprobar con requisitos faltantes → 409 enumerando `missing`, sin cambio de estado (E)
- Pregunta del lector y ángulo presentes pero en blanco cuentan como faltantes; el tema no puede quedar vacío (B)
- Aprobar completa → `idea_approved`, `fields_frozen` y evento `piece.approved` con el snapshot de campos y el actor (O)
- Aprobar con clave de API → 403 (B)
- Re-aprobar una pieza ya aprobada → 409 (E)

**CU-9 — Gestionar recursos:**

- Crear recurso suelto → 201 con `type: resource` (O)
- Crear recurso con `pieceIds` → nace ligado y la madurez de la pieza salta (I)
- Ligar un recurso existente a una pieza → 201 y cuenta para la puerta (O)
- Ligar un documento de otro workspace → 404 (B, tenant)
- Desligar en `propuesta` con clave → 204 y la madurez baja (O)
- Desligar en pieza aprobada con clave → 403; con sesión → 204 (B)
- Borrar un documento elimina sus enlaces (O)
- Borrar un recurso que sostiene una pieza aprobada con clave → 403; con sesión → 204 (B)
- Leer pieza o documento de otro workspace → 404 (I)

**Lectura:**

- `GET /api/pieces` sirve `maturity` calculada en el servidor para cada pieza (Z, I)
- `GET /api/pieces/:id` devuelve la pieza con sus documentos ligados, `missing[]` y `maturity` (O)

## Revisión

- Subagente: 2026-11-25 — Aprueba
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
