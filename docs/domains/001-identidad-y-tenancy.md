# Identidad y tenancy

## Propósito

Identificar a las personas y a los agentes que trabajan en Contento y delimitar el espacio de trabajo al que pertenece cada uno. Cubre las cuentas, los workspaces con sus roles, las invitaciones, las claves de agente y el registro de eventos.

## Referencia del modelo

Estado: modelo declarado en la propuesta 001 y en el PRD `docs/prd/001-fundacion.md`. Ninguna entidad está implementada todavía; las anclas se completan al cerrar cada tarea de la épica 001.

- **Lenguaje ubicuo:**
  - **Cuenta:** persona o agente con identidad propia que accede al sistema con correo y contraseña.
    - Ancla: pendiente, tarea `docs/tasks/003-autenticacion.md`
  - **Workspace:** frontera de tenant. Agrupa miembros, roles y datos de trabajo.
    - Ancla: pendiente, tarea `docs/tasks/004-tenancy.md`
  - **Workspace personal:** workspace que se crea al registrar una cuenta. Su propietario es la cuenta, lleva su nombre, puede renombrarse y no puede eliminarse.
    - Ancla: pendiente, tarea `docs/tasks/004-tenancy.md`
  - **Rol:** permiso de un miembro dentro de un workspace. Por defecto, `owner`, `admin` y `member`; el dominio añade `autor` y `editor`.
    - Ancla: pendiente, tarea `docs/tasks/004-tenancy.md`
  - **Invitación:** solicitud por correo para unirse a un workspace con un rol. Caduca.
    - Ancla: pendiente, tarea `docs/tasks/004-tenancy.md`
  - **Clave de agente:** credencial de API ligada a un workspace, con permisos propios.
    - Ancla: pendiente, tarea `docs/tasks/005-api-keys.md`
  - **Evento:** hecho registrado de solo inserción. Tiene entidad, tipo con formato `entidad.accion`, actor, instante y datos.
    - Ancla: pendiente, tarea `docs/tasks/006-registro-eventos.md`
- **Entidades / estado:**
  - Cuenta, Workspace, Miembro (cuenta + rol en un workspace), Invitación (pendiente, aceptada, caducada), Clave de agente, Evento.
  - Ancla: pendiente, tareas 003 a 006.
- **Invariantes:**
  - Toda cuenta tiene exactamente un workspace personal, creado dentro del mismo registro. Si la creación falla, el registro no se completa.
    - Ancla: pendiente, tarea `docs/tasks/004-tenancy.md`
  - El workspace personal no se puede eliminar; sí se puede renombrar.
    - Ancla: pendiente, tarea `docs/tasks/004-tenancy.md`
  - Un miembro no lee datos de otro workspace.
    - Ancla: pendiente, tarea `docs/tasks/004-tenancy.md`
  - Una invitación caducada no se acepta.
    - Ancla: pendiente, tarea `docs/tasks/004-tenancy.md`
  - Una clave de agente pertenece a un workspace y solo tiene los permisos concedidos.
    - Ancla: pendiente, tarea `docs/tasks/005-api-keys.md`
  - Un evento no se edita ni se borra, y su tipo cumple el formato `entidad.accion`.
    - Ancla: pendiente, tarea `docs/tasks/006-registro-eventos.md`
- **Operaciones:**
  - Registrar cuenta (crea su workspace personal), acceder, cerrar sesión.
  - Crear workspace, invitar miembro, aceptar invitación, asignar rol.
  - Crear, verificar y eliminar clave de agente.
  - Registrar evento.
  - Ancla: pendiente, tareas 003 a 006.

## Explicación del dominio

El dominio responde a quién actúa y en qué espacio. Todo lo demás de Contento —piezas, briefs, pipeline— se apoya en esa respuesta: el workspace es la frontera de tenant y el rol determina qué puede hacer cada miembro. Por eso la identidad y el tenant se fijan antes que cualquier entidad editorial.

- **Fronteras:**
  - Dentro: cuentas, workspaces, roles, invitaciones, claves de agente y el registro de eventos como infraestructura.
  - Fuera: contenido editorial (piezas, series, briefs, borradores), que pertenece a los dominios de las propuestas 002 y 003; el servidor MCP, que es la propuesta 004; la infraestructura de persistencia, que es la tarea 002 y no define modelo.
  - Relaciones: el dominio editorial consulta el rol del miembro para autorizar sus operaciones. El registro de eventos recibe hechos de todos los dominios, pero no los interpreta.
- **Decisiones relevantes:**
  - Ninguna registrada en `docs/decisions/`. El stack (Hono, Drizzle, better-auth y un único esquema `pg-core`) está fijado en la propuesta 001 y en `docs/research/2026-10-stack-fundacion.md`.

## Estado de salud

- Última revisión: 2026-10-30
- Divergencias conocidas:
  - El modelo está declarado, pero ninguna de sus entidades existe en el código. Las anclas quedan pendientes hasta las tareas 003 a 006.
  - La decisión del stack no está registrada como decisión en `docs/decisions/`; se evaluará al cerrar la épica 001.
