# Identidad y tenancy

## Propósito

Identificar a las personas y a los agentes que trabajan en Contento y delimitar el espacio de trabajo al que pertenece cada uno. Cubre las cuentas, los workspaces con sus roles, las invitaciones, las claves de agente y el registro de eventos.

## Referencia del modelo

Estado: modelo declarado en la propuesta 001 y en el PRD `docs/prd/001-fundacion.md`. Las cuentas, los workspaces, los roles y las invitaciones ya existen en código; la clave de agente y el evento se implementan en las tareas 005 y 006.

- **Lenguaje ubicuo:**
  - **Cuenta:** persona o agente con identidad propia que accede al sistema con correo y contraseña.
    - Ancla: `src/server/schema.ts` (tablas `user`, `session`, `account` y `verification`, generadas por el CLI), `src/server/auth.ts` (`createAuth`, `mountAuth`)
  - **Workspace:** frontera de tenant. Agrupa miembros, roles y datos de trabajo.
    - Ancla: `src/server/schema.ts` (tabla `organization`), `src/server/auth.ts` (plugin `organization` de better-auth en `createAuth`)
  - **Workspace personal:** workspace que se crea al registrar una cuenta. Su propietario es la cuenta, lleva su nombre, puede renombrarse y no puede eliminarse.
    - Ancla: `src/server/schema.ts` (campo `personal` de `organization`), `src/server/auth.ts` (`createPersonalWorkspace` en `databaseHooks.account.create.before`, `organizationHooks.beforeDeleteOrganization`)
  - **Rol:** permiso de un miembro dentro de un workspace. Por defecto, `owner`, `admin` y `member`; el dominio añade `autor` y `editor`.
    - Ancla: `src/server/auth.ts` (`createAccessControl` y `roles`, permisos declarados por recurso)
  - **Invitación:** solicitud por correo para unirse a un workspace con un rol. Caduca.
    - Ancla: `src/server/schema.ts` (tabla `invitation`), endpoints `/api/auth/organization/*` del plugin
  - **Clave de agente:** credencial de API ligada a un workspace, con permisos propios.
    - Ancla: pendiente, tarea `docs/tasks/005-api-keys.md`
  - **Evento:** hecho registrado de solo inserción. Tiene entidad, tipo con formato `entidad.accion`, actor, instante y datos.
    - Ancla: pendiente, tarea `docs/tasks/006-registro-eventos.md`
- **Entidades / estado:**
  - Cuenta, Workspace, Miembro (cuenta + rol en un workspace), Invitación (pendiente, aceptada, caducada), Clave de agente, Evento.
  - Ancla: `src/server/schema.ts` para la cuenta, el workspace (`organization`), el miembro (`member`) y la invitación (`invitation`); pendiente para la clave de agente y el evento, tareas 005 y 006.
- **Invariantes:**
  - Toda cuenta tiene exactamente un workspace personal, creado dentro del mismo registro. Si la creación falla, el registro no se completa.
    - Ancla: `src/server/auth.ts` (`createPersonalWorkspace` en `account.create.before`, dentro de la transacción del registro con `transaction: true`), verificado en `src/server/workspaces.test.ts`
  - El workspace personal no se puede eliminar; sí se puede renombrar.
    - Ancla: `src/server/auth.ts` (`organizationHooks.beforeDeleteOrganization` rechaza cuando `personal`), verificado en `src/server/workspaces.test.ts`
  - Un miembro no lee datos de otro workspace.
    - Ancla: `src/server/workspaces.test.ts` (rechazo de `get-full-organization` ajeno y `listOrganizations` solo propias)
  - Una invitación caducada no se acepta.
    - Ancla: `src/server/workspaces.test.ts` (invitación con `expiresAt` pasado rechazada)
  - Una clave de agente pertenece a un workspace y solo tiene los permisos concedidos.
    - Ancla: pendiente, tarea `docs/tasks/005-api-keys.md`
  - Un evento no se edita ni se borra, y su tipo cumple el formato `entidad.accion`.
    - Ancla: pendiente, tarea `docs/tasks/006-registro-eventos.md`
- **Operaciones:**
  - Registrar cuenta (crea su workspace personal), acceder, cerrar sesión.
    - Ancla: `src/server/auth.ts` (`mountAuth`, rutas `/api/auth/*`; el workspace personal en `databaseHooks.account.create.before`), verificado en `src/server/auth.test.ts` y `src/server/workspaces.test.ts`.
  - Crear workspace, invitar miembro, aceptar invitación, asignar rol.
    - Ancla: endpoints `/api/auth/organization/*` del plugin, verificado en `src/server/workspaces.test.ts`. Sin envío de correo: la invitación se crea dirigida a un correo y el invitado la acepta autenticado.
  - Crear, verificar y eliminar clave de agente.
  - Registrar evento.
  - Ancla: pendiente, tareas 005 y 006.

## Explicación del dominio

El dominio responde a quién actúa y en qué espacio. Todo lo demás de Contento —piezas, briefs, pipeline— se apoya en esa respuesta: el workspace es la frontera de tenant y el rol determina qué puede hacer cada miembro. Por eso la identidad y el tenant se fijan antes que cualquier entidad editorial.

- **Fronteras:**
  - Dentro: cuentas, workspaces, roles, invitaciones, claves de agente y el registro de eventos como infraestructura.
  - Fuera: contenido editorial (piezas, series, briefs, borradores), que pertenece a los dominios de las propuestas 002 y 003; el servidor MCP, que es la propuesta 004; la infraestructura de persistencia, que es la tarea 002 y no define modelo.
  - Relaciones: el dominio editorial consulta el rol del miembro para autorizar sus operaciones. El registro de eventos recibe hechos de todos los dominios, pero no los interpreta.
- **Decisiones relevantes:**
  - `docs/decisions/D001-stack-componible.md` — Hono, Drizzle, better-auth y React.
  - `docs/decisions/D002-pglite-desarrollo-postgres-produccion.md` — un único esquema `pg-core`, PGlite en desarrollo y pruebas, Postgres en producción.

## Estado de salud

- Última revisión: 2026-11-09
- Divergencias conocidas:
  - Las cuentas, los workspaces (con el personal y sus roles `autor`/`editor`) y las invitaciones existen en código (`organization`, `member`, `invitation` en `src/server/schema.ts`; plugin `organization` y hooks en `src/server/auth.ts`; verificado en `src/server/workspaces.test.ts`). La clave de agente y el evento siguen pendientes hasta las tareas 005 y 006.
