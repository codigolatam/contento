# Registro de eventos del dominio

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Crear el registro de eventos del dominio: quién, cuándo y sobre qué entidad ocurrió un hecho, con sus datos. Es la base del audit log y de la analítica futuras. El registro define la forma de los eventos, no su catálogo: los tipos concretos los añade cada propuesta que los produzca.

## Dependencias

- 002

## Entrada

- Tarea 002 completada.

## Resultado esperado

- Una tabla de eventos de solo inserción con entidad, tipo, actor, instante y datos en JSON.
- Un único punto de escritura de eventos.
- Consulta de los eventos de una entidad en orden cronológico.

## Criterios de calidad

- Cada evento registra entidad, tipo, actor, instante y datos.
- El tipo es texto con formato `entidad.accion` en minúsculas. El registro rechaza tipos con otro formato, pero no valida una lista cerrada de tipos.
- Los eventos no se editan ni se borran: el módulo no expone operaciones de actualización ni de borrado.
- El evento y el cambio que lo produce se confirman en la misma transacción.
- La consulta por entidad devuelve los eventos en orden cronológico.

## Procedimiento sugerido

1. Definir la tabla de eventos en el esquema de dominio.
2. Crear la función única de registro de eventos con validación de formato del tipo.
3. Probar con un evento de prueba de tipo ficticio, sin tipos de dominio.
4. Probar la atomicidad: si la transacción falla, no queda ningún evento huérfano.

## Notas

- Ninguna entidad usa el registro todavía. La propuesta 002 será su primer consumidor, con el cambio de estado de la pieza como primer tipo real; la 003 añadirá los suyos.
- La retención de eventos y los permisos para consultarlos quedan fuera de esta tarea. Se resolverán con la tarea 004 o después, cuando existan roles y datos reales.

## Contexto

- Archivos similares: `src/server/schema.ts` (esquema `pg-core` único; tablas de better-auth generadas más la extensión manual `organization.personal` —la tabla de eventos se define a mano aquí, no viene de plugin); `src/server/database.ts` (`createDatabase` devuelve `{ db, execute, migrate, close }`; `db` es la instancia drizzle que acepta transacciones); `src/server/database.test.ts` (patrón de pruebas de infraestructura); `src/server/workspaces.test.ts` y `src/server/api-keys.test.ts` (PGlite fresca por prueba: `createDatabase("")` + `migrate()` en `beforeEach`, `close()` en `afterEach`); `drizzle/` (migraciones emitidas por `drizzle-kit generate`; la `0002` ya está fusionada —la nueva es la `0003` de la serie).
- Patrones: TypeScript estricto; código, identificadores, nombres de pruebas y mensajes en inglés; sin comentarios; cobertura del 100 % con umbrales en `vitest.config.ts` (`schema.ts` excluido de la cobertura); migración generada con `drizzle-kit generate`, nunca escrita a mano; el módulo nuevo vive en `src/server/` con su prueba hermana.
- Dominio: `docs/domains/001-identidad-y-tenancy.md` declara «Evento» —hecho registrado de solo inserción, con entidad, tipo `entidad.accion`, actor, instante y datos— y su invariante (no se edita ni se borra; el tipo cumple el formato) como pendientes de ancla en esta tarea.
- Producto: ninguna guía de `product-docs/` cubre eventos —es infraestructura interna sin comportamiento de usuario—; el sensor de producto del cierre decidirá qué documentar, si algo.
- PRD: `docs/prd/001-fundacion.md` lo declara fuera de alcance como caso de uso («existe como infraestructura, pero ninguna acción de este conjunto lo alimenta»); no hay `CU-N` que tocar.
- Lecciones: `docs/lessons/convenciones-de-codigo.md` (código y pruebas en inglés) y `docs/lessons/pruebas.md` (ZOMBIE; la verificación contra Postgres real corre manual, fuera de la suite).
- Decisiones: D001 (stack Hono/Drizzle componible) y D002 (un único esquema `pg-core`, PGlite en desarrollo y pruebas, Postgres en producción).

## Conectividad

- Veredicto: conectada.
- Justificación: todo lo que la tarea asume existe en el codebase —`src/server/schema.ts` admite tablas de dominio junto a las generadas (la extensión `organization.personal` es precedente), la instancia drizzle de `createDatabase` soporta transacciones en ambos drivers, `pg-core` ofrece `jsonb` para los datos y la cadena de migraciones con `drizzle-kit generate` está operativa con la `0002` ya fusionada. Lo que falta —la tabla de eventos y el módulo de registro— es el propio objeto de la tarea.

## Plan técnico

La persistencia es un único esquema `pg-core` (`src/server/schema.ts`) consumido por `createDatabase`, que devuelve el `db` drizzle con transacciones en ambos drivers. El cambio encaja como tabla de dominio nueva más su módulo propio en `src/server/` —el primer módulo de dominio que no viene de un plugin—.

- [x] Definir la tabla `event` en `schema.ts` —id `bigserial`, `entity_type`, `entity_id`, `type`, `actor`, `occurred_at` con `defaultNow`, `data` `jsonb` no nulo con `{}` por defecto— e índice por `(entity_type, entity_id)`.
  - Aporta: la forma física del registro —solo inserción y ordenable por inserción— dentro del único esquema (D002).
  - Contexto: el id `bigserial` rompe a propósito la convención `text` de las tablas better-auth —esas usan texto porque el plugin las genera—; el orden cronológico necesita un orden de inserción fiable que un id texto no da.
- [x] Emitir la migración `0003` con `drizzle-kit generate`.
  - Aporta: la tabla nace igual en PGlite y Postgres sin SQL a mano.
- [x] Crear `src/server/events.ts` con `recordEvent` —valida el formato `entidad.accion` antes de insertar y acepta `db` o el `tx` de una transacción— y `listEvents` por entidad en orden cronológico; sin operaciones de actualización ni de borrado exportadas.
  - Aporta: el punto único de escritura y lectura del resultado esperado; la superficie exportada es la que cumple el invariante de solo inserción.
  - Contexto: aceptar el handle transaccional es lo que permite que el evento y el cambio que lo produce confirmen juntos —el criterio de atomicidad—; el actor es texto libre porque el dominio aún no fija su formato (persona o clave de agente).
- [x] Crear `src/server/events.test.ts` con PGlite fresca por prueba.
  - Aporta: la suite esperada con el aislamiento vigente (`createDatabase("")` + `migrate()` en `beforeEach`, `close()` en `afterEach`).
- [x] Verificar migración `0003` y un ciclo registro→consulta contra Postgres 15 real durante la tarea.
  - Aporta: el criterio de producción (D002) sin acoplar la suite; queda en «Verificación manual».

## Suite de pruebas esperada

- Consultar los eventos de una entidad sin hechos devuelve la lista vacía. (Z)
- Registrar un evento sin datos lo guarda con datos vacíos. (Z)
- Un evento registrado conserva entidad, tipo, actor, instante y datos, y la consulta por su entidad lo devuelve. (O)
- Varios eventos de una entidad se devuelven en orden cronológico; los de otra entidad no aparecen. (M)
- Se acepta un tipo `entidad.accion` en minúsculas y se rechazan tipos con mayúsculas, sin punto o con otra forma; no hay lista cerrada —un tipo ficticio válido pasa. (B)
- El módulo no expone operaciones de actualización ni de borrado de eventos. (I)
- Un evento registrado dentro de una transacción revertida no queda; dentro de una confirmada, sí. (I)
- Registrar un tipo inválido falla sin escribir la fila. (E)
- Regresión: tipado, linter y pruebas con cobertura del 100 %.
- Durante la tarea: la migración `0003` aplica en Postgres 15 real y un ciclo de registro y consulta funciona. Verificación manual, no queda en la suite.

## Desviaciones

- El patrón del tipo admite guion bajo dentro de cada segmento —`piece.draft_created` pasa— además de letras y dígitos. Motivo: los tipos reales que vendrán (`series.chapter_added`, `draft.saved`) necesitan componer palabras dentro de la acción y la forma declarada `entidad.accion` en minúsculas se mantiene —dos segmentos en minúsculas unidos por un punto, sin lista cerrada—. Decisión: la regex queda `^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$`; si un tipo futuro necesita otra forma, el formato se revisita entonces.

## Verificación manual

- Contra Postgres 15 (imagen `postgres:15-alpine`, contenedor efímero eliminado tras la prueba): la migración `0003` crea la tabla `event` con su índice y el `DEFAULT '{}'::jsonb`; `recordEvent` inserta y `listEvents` devuelve en orden cronológico por entidad excluyendo las demás; el `jsonb` hace round-trip; un evento dentro de una transacción revertida no queda y un tipo con mayúsculas se rechaza.

## Revisión

- Subagente: 2026-11-20 — Aprueba
- Usuario (ejecución): 2026-11-20 — Aprueba
- Usuario (cierre): 2026-11-20 — Aprueba
