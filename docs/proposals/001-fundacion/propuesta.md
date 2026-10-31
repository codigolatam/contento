# Fundación del backoffice y cuentas

## Estado

[a] Aprobada

## Problema

Contento no tiene base técnica: no existe aplicación, no hay cuentas
ni persistencia y no hay dónde ejecutar el dominio editorial. El
trabajo del proyecto vive hoy en documentos; la primera pieza de
software debe darle hogar.

Sin esa base no se puede construir nada del modelo —piezas, briefs,
pipeline, agentes— y cada decisión posterior quedaría condicionada
por una fundación improvisada en lugar de una deliberada. La
frontera de tenant (el workspace) y el registro de eventos son
decisiones de día uno que cuestan caro retrofitar.

Hoy el primer afectado es el autor que usa el proyecto: su flujo
editorial vive en documentos y skills, sin una superficie donde
ejecutarse.

## Oportunidad

Una fundación deliberada desde el inicio resuelve los problemas
genéricos —cuentas, sesiones, workspaces multi-tenant con roles e
invitaciones, claves de API para agentes— sobre piezas mantenidas
por terceros, y el registro de eventos da después el audit log y la
analítica sin construirlos de nuevo.

El stack componible corre en cualquier host como un proceso Node
más Postgres: independencia real de proveedor, sin heredar el
roadmap del framework de un tercero.

## Forma de solución

Base de aplicación nueva: scaffold del servicio y de la web,
autenticación y tenancy sobre un componente existente, e
infraestructura de dominio (persistencia, eventos) sobre la que las
propuestas siguientes montan el modelo editorial.

## Solución

Aplicación TypeScript de un solo proceso: servidor Hono con Drizzle
sobre Postgres, con PGlite en desarrollo y tests, y aplicación web
React; better-auth con su plugin de organizaciones resuelve cuentas,
sesiones, workspaces como frontera de tenant, roles (autor, editor)
e invitaciones; su plugin de claves de API da la identidad por
agente.

Al registrarse, cada cuenta recibe un workspace personal con el
nombre de su autor, del que este es propietario y que no puede
eliminarse.

Sobre esa base se crea el registro de eventos del dominio —quién,
cuándo, de qué a qué— y el esqueleto de navegación de la
aplicación editorial, donde vivirán las superficies de trabajo de
las propuestas siguientes.

## Alternativas consideradas

- Payload CMS: resuelve auth, roles y admin de serie, pero la
  aplicación entera queda acoplada a Next.js; el proyecto prefiere
  independencia de proveedor.
- Directus: independiente del proveedor y con admin propio, pero
  licencia BSL hasta la v11 y MSCL desde la v12, extensiones en Vue y
  lógica de dominio en Flows poco idiomática para las puertas del
  pipeline.
- Clerk o Auth.js (sin better-auth): Clerk acopla la identidad a un
  servicio externo; Auth.js, mantenido desde 2025 por el equipo de
  Better Auth, exige construir encima la tenancy y las claves de agente
  que better-auth trae de serie.

## Fuera de alcance

- Las entidades del dominio editorial (piezas, series, briefs,
  borradores) y sus superficies: propuestas 002 y 003.
- El servidor MCP y su gobernanza: propuesta 004.
- Despliegue de producción, observabilidad y CI más allá del
  andamiaje mínimo.

## Investigaciones de apoyo

- docs/research/2026-10-stack-fundacion.md: verificación de las
  afirmaciones técnicas del stack y de las alternativas descartadas.

## Borradores

- `docs/tasks/001-scaffold.md` — Scaffold del servicio y de la aplicación web
- `docs/tasks/002-persistencia.md` — Infraestructura de persistencia (depende de 001)
- `docs/tasks/003-autenticacion.md` — Autenticación con better-auth (depende de 002)
- `docs/tasks/004-tenancy.md` — Workspaces, roles autor y editor, invitaciones (depende de 003)
- `docs/tasks/005-api-keys.md` — Claves de API por agente (depende de 004)
- `docs/tasks/006-registro-eventos.md` — Registro de eventos del dominio (depende de 002)
- `docs/tasks/007-navegacion.md` — Esqueleto de navegación de la aplicación editorial (depende de 001)

## Revisión

- Usuario: 2026-10-30 — Aprueba
- Nota de cambio (2026-10-30): se añade el workspace personal al registro de cuentas, a petición del usuario. No altera el alcance de las demás piezas.
