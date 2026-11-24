# Escribir el borrador: de `idea aprobada` a `lista`

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

El segundo corte: completar el pipeline hacia adelante. «Empezar
redacción» crea —o reabre— el `borrador` ligado a la pieza, el
editor lo escribe junto a la ficha congelada y «Aprobar borrador»
lo congela materializando `lista`, lista para exportar.

## Dependencias

- 010 (la API del pipeline)
- 014 (la ficha congelada que se muestra junto al editor)

## Entrada

- Modelo y API del pipeline (tarea 010); kanban y ficha de la
  pieza (tarea 014).

## Resultado esperado

- API: `empezar_redaccion` —crea el `borrador` ligado si no existe,
  lo reabre si ya existe, solo desde `idea aprobada`—; escribir el
  cuerpo del documento (rechazada si está congelado);
  `aprobar_borrador` —congela el documento, puerta humana, evento
  con actor—. Cada transición registra su evento con el actor.
- Acción «Empezar redacción» en la ficha: cualquier actor puede
  ejecutarla, incluido el agente.
- Vista de redacción: editor del borrador con la ficha de la idea
  —campos congelados— visible junto al texto. El editor es un
  `textarea` plano —sin editor rico ni dependencias nuevas—.
- «Aprobar borrador» congela la edición y pasa la pieza a `lista`;
  la revisión cicla dentro de `en redacción` sin cambiar de estado.

## Criterios de calidad

- `empezar_redaccion` es idempotente: nunca crea un segundo
  borrador para la misma pieza, y solo opera desde `idea aprobada`
  —invocado desde `propuesta` se rechaza, cubierto en la suite—.
- El documento congelado rechaza escritura por UI y por API.
- `aprobar_borrador` devuelve `403` a una clave de API, cubierto en
  la suite; escribir y empezar la redacción los puede hacer el
  agente.
- Las transiciones inexistentes (`propuesta → lista` directo) se
  rechazan.

## Procedimiento sugerido

1. Endpoints de redacción: empezar/reabrir, escribir el cuerpo,
  aprobar el borrador.
2. Vista de redacción con la ficha congelada junto al editor.
3. Suite: el ciclo redacción→lista, la regla de un solo borrador
   por pieza y los `403`.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
