# Fundación del backoffice y cuentas

## Estado

[x] Planificada | [ ] Completada

## Objetivo

Un autor puede crear su cuenta y recibir un workspace personal, crear workspaces adicionales, invitar colaboradores con rol autor o editor y dar a sus agentes claves de API propias ligadas a ese workspace. La base corre sobre un único esquema que funciona igual en desarrollo y producción.

## Alcance

- **Dentro:** el scaffold, la persistencia, la autenticación, la tenancy, las claves de agente y el esqueleto de navegación.
- **Fuera:** las entidades editoriales (propuestas 002 y 003), el servidor MCP (004) y el registro de eventos como consumidor real: ninguna acción de este conjunto lo alimenta todavía.

## Piezas

- [ ] docs/tasks/001-scaffold.md — Scaffold del servicio y de la aplicación web
- [ ] docs/tasks/002-persistencia.md — Infraestructura de persistencia
- [ ] docs/tasks/003-autenticacion.md — Autenticación con better-auth
- [ ] docs/tasks/004-tenancy.md — Workspaces, roles e invitaciones
- [ ] docs/tasks/005-api-keys.md — Claves de API por agente
- [ ] docs/tasks/006-registro-eventos.md — Registro de eventos del dominio
- [ ] docs/tasks/007-navegacion.md — Esqueleto de navegación de la aplicación editorial

## Plan técnico

- **Orden:** 001 → 002 → 003 → 004 → 005. En paralelo: 007 tras 001, y 006 tras 002.
- **Dependencias:** ninguna externa; todo sobre el stack de la investigación.
- **Decisiones transversales (ya tomadas):**
  - Hono, Drizzle y better-auth, con un esquema `pg-core` único.
  - PGlite en desarrollo y tests, Postgres en producción.
  - El workspace es una organización de better-auth.
  - Cada cuenta recibe un workspace personal al registrarse.
  - La infraestructura de persistencia no define tablas de dominio.
  - El tipo de evento es texto `entidad.accion`, sin catálogo cerrado.

## Criterio de cierre

Las siete tareas completadas. La prueba de humo pasa en PGlite y en Postgres. Cada cuenta nueva tiene su workspace personal al registrarse, con el nombre de su autor, que puede renombrarse y no puede eliminarse. Un usuario recorre registro, creación de un workspace, invitación y clave de agente de extremo a extremo.

## Revisión

- Usuario: 2026-10-30 — Aprueba
