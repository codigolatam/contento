# Fundación del backoffice y cuentas

## Estado

[ ] Borrador

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

## Oportunidad

Una fundación deliberada desde el inicio resuelve los problemas
genéricos —cuentas, sesiones, workspaces multi-tenant con roles e
invitaciones, claves de API para agentes— sobre piezas mantenidas
por terceros, y el registro de eventos como fundamento da audit log
y analítica gratis después.

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
sobre Postgres (SQLite en desarrollo) y aplicación web React.
better-auth con su plugin de organizaciones resuelve cuentas,
sesiones, workspaces como frontera de tenant, roles (autor, editor)
e invitaciones; su plugin de claves de API da la identidad por
agente.

Sobre esa base se crea el registro de eventos del dominio —quién,
cuándo, de qué a qué— y el layout de la aplicación editorial donde
vivirán las superficies de trabajo.

## Alternativas consideradas

- Payload CMS: resuelve auth, roles y admin de serie, pero la
  aplicación entera queda acoplada a Next.js y al ciclo de releases
  que Vercel dicta; el proyecto prefiere independencia de proveedor.
- Directus: independiente del proveedor y con admin propio, pero
  licencia BSL, extensiones en Vue y lógica de dominio en Flows poco
  idiomática para las puertas del pipeline.
- Clerk o Auth.js sin better-auth: Clerk es un servicio acoplado;
  Auth.js exige construir encima la tenancy y las claves de agente
  que better-auth trae de serie.

## Fuera de alcance

- Las entidades del dominio editorial (piezas, series, briefs,
  borradores) y sus superficies: propuestas 002 y 003.
- El servidor MCP y su gobernanza: propuesta 004.
- Despliegue de producción, observabilidad y CI más allá del
  andamiaje mínimo.

## Investigaciones de apoyo

- Comparación informal de stack realizada en conversación (no
  persistida): Payload, Directus y stack componible evaluados contra
  la independencia de proveedor.

## Borradores

## Revisión

- Usuario: [fecha] — [Aprueba | Solicita cambios | Rechaza]
