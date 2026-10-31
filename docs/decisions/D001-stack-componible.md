# D001: Stack componible sobre Hono, Drizzle y better-auth

## Estado

Aceptada

## Contexto

La fundación necesita servidor, persistencia, cuentas, workspaces con roles y claves para agentes, sin depender de un proveedor concreto. Las alternativas evaluadas fueron Payload CMS, que queda acoplado a Next.js; Directus, cuya licencia cambió y cuya lógica de dominio se expresa en Flows; y Clerk o Auth.js, que o son un servicio externo o no traen tenancy ni claves de agente.

## Decisión

Usamos Hono sobre Node para el servidor, Drizzle como ORM, better-auth para cuentas, workspaces como organizaciones y claves de agente, y React para la aplicación web.

## Justificación

El stack depende de piezas MIT sin proveedor de hosting ni de framework de terceros. better-auth cubre de serie las cuentas, las invitaciones, los roles y las claves por agente, que serían trabajo propio con las alternativas. Auth.js queda descartado: desde 2025 lo mantiene el equipo de better-auth, que recomienda este último para proyectos nuevos.

Consecuencias:

- Los roles del dominio (autor, editor) hay que definirlos con el control de acceso de better-auth.
- La versión mínima de Node es 22.22.2, la que exigen las dependencias instaladas.

## Referencias

- `docs/proposals/001-fundacion/propuesta.md`
- `docs/research/2026-10-stack-fundacion.md`
