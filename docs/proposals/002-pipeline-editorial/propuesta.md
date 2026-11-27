# Pipeline editorial con puertas

## Estado

[a] Aprobada

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
maduración en algo comprobable: una idea solo pasa a aprobada
cuando reúne sus requisitos y un humano confirma. Es la forma que la
industria valida —los kanban de Edit Flow y compañía— reducida a lo
esencial, y la superficie que el flujo local necesita.

Los eventos de cambio de estado los registra la fundación, así que
la visibilidad del trabajo sale del mismo modelo.

## Forma de solución

Flujo nuevo: las piezas recorren un pipeline de estados con puertas
entre ellos, visible en un kanban.

## Solución

La pieza como unidad de trabajo nace en `propuesta` y recorre el
pipeline `propuesta → idea aprobada → en redacción → lista`,
estados fijos del workspace en el MVP, más `descartada` como estado
terminal. El alta exige una primera formulación del tema —provisional
y editable hasta la puerta— que da nombre visible a la tarjeta: sin
ella la pieza sería anónima en el kanban. La revisión no es un estado
propio: cicla dentro de la redacción —la retroalimentación devuelve a
escribir sin salir del estado.

**Puerta `propuesta → idea aprobada`** — la ficha de la pieza en
`propuesta` es su pantalla de maduración: la persona (o el agente,
que puede rellenar campos pero no aprobar) consolida los cuatro
requisitos de la puerta:

- **Tema** — de qué trata, en una línea.
- **Pregunta del lector** — qué duda o necesidad responde la pieza;
  es el criterio de relevancia.
- **Ángulo** — la toma concreta: por qué esta pieza y no la
  genérica.
- **Soporte** — al menos un **recurso** ligado a la pieza: las
  fuentes, ejemplos y material con que se sostiene.

El recurso es un documento del workspace que vive de forma
independiente y se comparte: la misma fuente puede sostener varias
piezas. Se crea desde la ficha de la pieza o en la sección de
recursos del workspace, donde puede nacer ya ligado —la relación es
dato, no superficie— o quedar suelto para ligarlo después. Ligar y
desligar es libre mientras la pieza sigue en `propuesta`; una vez
aprobada, ligar sigue libre —el material puede seguir creciendo—
pero desligar recursos o borrarlos exige actor de sesión. Borrar un
recurso elimina el documento con sus relaciones. Los documentos del
workspace llevan un tipo que declara su función —`recurso`,
`borrador`, …— y ese tipo gobierna su ciclo de vida.

El botón «Aprobar» verifica los cuatro requisitos en el servidor
—si falta alguno, la respuesta los enumera—, registra la
transición con el actor y **congela los campos** —tema, pregunta
y ángulo—: de ahí en adelante son solo lectura. Los recursos
ligados no se congelan: el material puede seguir creciendo durante
la redacción sin contradecir la puerta, que ya quedó registrada.
La aprobación solo la puede confirmar un actor de sesión: una clave
de API recibe `403` —la puerta humana es invariante del servidor,
no convención de la UI.

**Transición `idea aprobada → en redacción`** — «Empezar redacción»
crea un **documento nuevo ligado a la pieza** —su `borrador`—; el
editor muestra la ficha de la idea (campos congelados) junto al
texto, para tener el contexto a mano. Idear y redactar quedan como
dos momentos elegibles por separado.

**Puerta `en redacción → lista`** — «Aprobar borrador» congela la
edición del documento y materializa «lista para publicar» —lista
para exportar, no publicada en un canal externo.

El pipeline admite retroceso y descarte. Una pieza en `idea
aprobada` o `en redacción` puede volver a `propuesta`: los campos
se descongelan para reencuadrar y la vuelta queda registrada con su
motivo; el borrador de una pieza devuelta se conserva —sigue
editable, como cualquier texto— y «Empezar redacción» lo reabre en
lugar de crear otro. Una pieza `lista` puede volver a `en
redacción`: el documento se descongela para correcciones y la
reapertura queda registrada con su motivo. En cualquier estado la
pieza puede descartarse —con su motivo—: pasa a `descartada`,
estado terminal que la retira del kanban activo junto a su
borrador; sus recursos ligados sobreviven en el workspace y el
enlace queda como parte de su rastro. Una vista de archivo la
conserva consultable con su rastro de eventos.

Las puertas y los movimientos que frenan o retiran una pieza son
humanos: aprobar la idea, aprobar el borrador, retroceder, reabrir,
descartar y quitar el soporte de una pieza aprobada —desligar o
borrar sus recursos— solo los confirma un actor de sesión
—cualquier miembro del workspace—.
Todo lo demás —crear piezas y recursos, rellenar campos, ligarlos,
empezar la redacción, escribir— lo puede hacer el agente: la
máquina prepara, la persona decide.

El kanban del pipeline es la superficie de trabajo: cuatro
columnas, la tarjeta muestra el tema provisional y la madurez de la
propuesta (`n/4` requisitos) y, en cada ficha, la sección de puerta
con lo que falta para el siguiente estado.

La pantalla de acceso —registro y entrada por la interfaz, que hoy
no existe— es prerrequisito de cualquier superficie dirigida a
personas y va como tarea previa independiente.

## Alternativas consideradas

- Estados libres sin puertas: convierte el pipeline en un kanban
  genérico y pierde justo lo que distingue el oficio editorial.
- Workflow configurable desde el MVP: la variabilidad de estados es
  real (los custom statuses de Edit Flow), pero el default replica
  el flujo de referencia y la configuración puede llegar después.
- Revisión como estado propio (`en revisión`): la industria la
  separa (In Review, Pending Review), pero en este flujo la
  retroalimentación devuelve a escribir sin cambiar de estado —la
  columna extra solo dibujaría un vaivén que ya cabe en Redacción.
- Checklist materializado de puerta (quién y cuándo marcó cada
  requisito): auditoría más rica, pero el evento de transición ya
  registra el hecho de la aprobación; ceremonia innecesaria para el
  MVP.
- Estado derivado del registro de eventos (sin columna de estado,
  solo proyección): ajuste puro con la infraestructura de
  eventos, pero abstrae el modelo justo cuando el dominio se
  presenta por primera vez; el evento ya garantiza el rastro.
- Soporte como campo de la ficha: lo convierte en respuesta en
  lugar de material —no puede compartirse entre piezas sin
  duplicar— y la congelación de la puerta bloquearía justo el
  material que crece durante la redacción.
- Congelación sin retorno: inmutable de verdad, pero el ángulo se
  descubre erróneo justo al escribir; el retroceso con evento
  conserva el rastro sin la ceremonia de descartar y recrear.
- Sin estado de descarte: deja las propuestas muertas en la primera
  columna para siempre, justo la mezcla de madurez que el pipeline
  viene a distinguir.
- Informe de revisión dentro de esta propuesta: merece propuesta
  propia junto a la exportación; «Aprobar borrador» ya funciona
  como transición con confirmación humana.

## Fuera de alcance

- Workflow configurable por workspace: el MVP fija la plantilla por
  defecto.
- Series (arcos editoriales): el MVP trabaja piezas sueltas; la
  agrupación bajo un arco común merece propuesta propia.
- Calendario editorial, story budget y notificaciones por cambio de
  estado.
- Informe de revisión como entidad y comentarios anclados al
  borrador.
- Biblioteca de recursos con carga de archivos: el recurso del MVP
  es texto —título y nota—.
- Analítica de etapa: los eventos ya quedan registrados, la vista
  llega después.

## Investigaciones de apoyo

- Ninguna.

## Borradores

- `docs/tasks/010-modelo-y-api-pipeline.md` — Modelo y API del
  pipeline editorial
- `docs/tasks/011-escribir-el-borrador.md` — Escribir el borrador:
  de `idea aprobada` a `lista` (depende de 010 y 014)
- `docs/tasks/012-retroceso-y-descarte.md` — Retroceso, reapertura
  y descarte (depende de 011)
- `docs/tasks/013-seccion-recursos.md` — Sección de recursos del
  workspace (depende de 010)
- `docs/tasks/014-kanban-y-ficha.md` — Kanban del pipeline y ficha
  de maduración (depende de 009 y 010)

## Revisión

- Usuario: 2026-11-23 — Aprueba
