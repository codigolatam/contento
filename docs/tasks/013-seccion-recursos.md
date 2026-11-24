# Sección de recursos del workspace

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

La biblioteca de material de soporte: una sección del workspace que
lista los recursos con las piezas que sostienen, y donde crearlos,
editarlos, ligarlos, desligarlos y borrarlos respetando la regla
post-puerta.

## Dependencias

- 010

## Entrada

- API de recursos y del enlace pieza↔recurso (borrador 01).

## Resultado esperado

- API: listar los recursos del workspace con sus enlaces y editar
  el recurso —título, nota, enlace— (crear, ligar, desligar y
  borrar ya existen desde el borrador 01).
- Sección que lista los recursos mostrando todas las piezas que
  cada uno sostiene.
- Creación desde la sección, suelta o ya ligada a una pieza.
- Edición, ligado, desligado y borrado del recurso desde la
  sección, con las reglas de la API reflejadas en la superficie:
  quitar soporte de una pieza aprobada solo se ofrece a actores de
  sesión.

## Criterios de calidad

- Un recurso compartido muestra todas sus piezas.
- La superficie no ofrece desligar ni borrar soporte de pieza
  aprobada sin sesión, coherente con la API.
- Borrar un recurso elimina el documento con sus enlaces.
- La interfaz usa solo tokens de la guía de estilo.

## Procedimiento sugerido

1. Endpoints de listado de recursos con enlaces y de edición.
2. Sección con lista, creación, edición y gestión de enlaces.
3. Suite de la superficie y sus reglas de permiso por estado de la
   pieza.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
