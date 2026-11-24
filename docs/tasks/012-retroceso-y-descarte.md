# Retroceso, reapertura y descarte

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

El tercer corte: el pipeline completo en ambos sentidos. La pieza
puede volver a `propuesta` descongelando sus campos, una `lista`
puede reabrir su borrador para correcciones, y cualquier estado
puede descartarse al archivo —todos movimientos humanos con motivo
registrado.

## Dependencias

- 011

## Entrada

- Ciclo de vida hacia adelante completo (borradores 01 y 02).

## Resultado esperado

- API: `retroceder` (`idea aprobada` o `en redacción` →
  `propuesta`: descongela los campos, motivo, conserva el borrador
  editable), `reabrir` (`lista → en redacción`: descongela el
  documento, motivo), `descartar` (estado terminal desde cualquier
  estado, motivo, retira la pieza y su borrador al archivo) y el
  listado del archivo.
- Al descartar, los recursos ligados sobreviven en el workspace y
  el enlace queda como parte del rastro de la pieza.
- Los tres movimientos exigen actor de sesión: `403` a clave de
  API.
- Acciones humanas con captura de motivo en la ficha y en la vista
  de redacción; vista de archivo con las piezas descartadas, su
  motivo y su rastro consultables —expone por HTTP el listado de
  eventos que `listEvents` ya ofrece a nivel base de datos—.
- Tras un retroceso, la ficha vuelve a ser la pantalla de
  maduración con campos editables y permite abrir el borrador
  conservado mientras la pieza está en `propuesta`; al re-aprobar y
  «Empezar redacción» se reabre ese borrador.

## Criterios de calidad

- Retroceso, reapertura y descarte registran evento con actor y
  motivo.
- El borrador de una pieza devuelta conserva su texto y sigue
  editable mientras la pieza está en `propuesta`.
- Una pieza `lista` que necesita reencuadre hace los dos gestos
  —reabrir, retroceder— con sus dos motivos: el grafo lo exige.
- `descartada` rechaza toda transición posterior; la vista de
  archivo la muestra con su rastro.

## Procedimiento sugerido

1. Endpoints de retroceso, reapertura, descarte y archivo, con sus
   permisos de sesión.
2. Acciones con captura de motivo en la ficha y en la vista de
   redacción; vista de archivo.
3. Suite: los tres movimientos, la recongelación, la conservación
   del borrador y la terminalidad del descarte.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
