# Registro de eventos del dominio

## Estado

[ ] Pendiente

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
