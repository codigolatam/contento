# Pipeline editorial con puertas

## Estado

[ ] Borrador

## Problema

El trabajo editorial —idear, madurar, encuadrar, escribir, revisar—
se gestiona en herramientas genéricas que no conocen el oficio: una
idea sin madurar pesa lo mismo que una pieza comprometida, y no hay
constancia de por qué una pieza avanza o se frena.

Para el primer usuario —un autor con agentes cuyo flujo ya existe
como archivos y skills— la falta de superficie significa que el
pipeline vive disperso, sin visibilidad ni estado comprobable.

## Oportunidad

Un pipeline de estados con puertas verificables convierte la
maduración en algo comprobable: una idea solo pasa a comprometida
cuando reúne sus requisitos y un humano confirma. Es la forma que la
industria valida —los kanban de Edit Flow y compañía— reducida a lo
esencial, y la superficie que el flujo local necesita.

Los eventos de cambio de estado los registra la fundación, así que
la visibilidad del trabajo sale del mismo modelo.

## Forma de solución

Flujo nuevo: las piezas recorren un pipeline de estados con puertas
entre ellos, visible en un kanban. Las series agrupan piezas bajo un
arco editorial propio.

## Solución

La pieza como unidad de trabajo recorre el pipeline
`idea → lista → en redacción → en revisión → publicado`, estados
fijos del workspace en el MVP. Las puertas son parte del modelo:
`idea → lista` exige los tres requisitos verificables (pregunta del
lector, ángulo, soporte) más confirmación humana, y la revisión
aprobada materializa «listo para publicar».

La serie es el arco editorial: marco propio (pregunta del arco,
ángulo, soporte), lista de piezas y ciclo
`propuesta → en curso → cerrada`. El kanban del pipeline es la
superficie de trabajo.

## Alternativas consideradas

- Estados libres sin puertas: convierte el pipeline en un kanban
  genérico y pierde justo lo que distingue el oficio editorial.
- Workflow configurable desde el MVP: la variabilidad de estados es
  real (los custom statuses de Edit Flow), pero el default replica
  el flujo de referencia y la configuración puede llegar después.
- Informe de revisión dentro de esta propuesta: merece propuesta
  propia junto a la exportación; el estado `en revisión` ya funciona
  como transición con confirmación humana.

## Fuera de alcance

- Workflow configurable por workspace: el MVP fija la plantilla por
  defecto.
- Calendario editorial, story budget y notificaciones por cambio de
  estado.
- Informe de revisión como entidad y comentarios anclados al
  borrador.
- Analítica de etapa: los eventos ya quedan registrados, la vista
  llega después.

## Investigaciones de apoyo

- Ninguna.

## Borradores

## Revisión

- Usuario: [fecha] — [Aprueba | Solicita cambios | Rechaza]
