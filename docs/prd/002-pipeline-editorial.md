# PRD — Pipeline editorial con puertas

El trabajo editorial vive disperso sin estado comprobable: una
idea a medio madurar pesa lo mismo que una pieza comprometida.
Este conjunto da a cada pieza un pipeline de estados con puertas
verificables donde solo una persona confirma los avances —la
máquina prepara y escribe, la persona decide y retira—.

## Usuarios

- El autor que usa Contento, por la interfaz con sesión.
- Sus colaboradores en el workspace, cualquier miembro con sesión
  puede confirmar puertas.
- Sus agentes, cada uno con su clave de API: preparan y escriben,
  nunca confirman.

## Casos de uso

- **CU-1 — Crear una pieza:** una persona desde el kanban o un
  agente por la API crea una pieza; nace en `propuesta`.
- **CU-2 — Madurar la idea:** en la ficha de la pieza se
  consolidan el tema, la pregunta del lector, el ángulo y al
  menos un recurso ligado; la tarjeta muestra la madurez `n/4`.
  - Borde: aprobar con requisitos faltantes devuelve la
    enumeración de lo que falta, sin cambio de estado.
- **CU-3 — Aprobar la idea:** un miembro con sesión confirma; el
  servidor verifica los cuatro requisitos y congela tema,
  pregunta y ángulo.
  - Borde: una clave de API recibe `403` — solo personas
    aprueban.
- **CU-4 — Escribir el borrador:** cualquier actor inicia la
  redacción —se crea el `borrador` ligado a la pieza— y escribe
  junto a la ficha congelada; la revisión cicla dentro de
  `en redacción` sin cambiar de estado.
  - Variante: volver a «Empezar redacción» sobre una pieza ya en
    redacción no crea un segundo borrador.
- **CU-5 — Aprobar el borrador:** un miembro con sesión congela
  el documento; la pieza queda `lista`, lista para exportar.
- **CU-6 — Devolver una pieza a maduración:** un miembro con
  sesión devuelve una `idea aprobada` o `en redacción` a
  `propuesta` con su motivo; los campos se descongelan y el
  borrador se conserva, editable mientras la pieza vuelve a
  `propuesta` y reabierto al re-aprobar.
- **CU-7 — Reabrir una pieza lista:** un miembro con sesión
  devuelve una `lista` a `en redacción` con su motivo; el
  documento se descongela para correcciones.
  - Variante: reencuadrar una `lista` exige los dos gestos —
    reabrir y retroceder—, cada uno con su motivo.
- **CU-8 — Descartar una pieza:** un miembro con sesión descarta
  desde cualquier estado con su motivo; es terminal, la pieza
  sale del kanban junto a su borrador y queda consultable en la
  vista de archivo con su rastro. Los recursos ligados sobreviven
  en el workspace y el enlace queda como parte del rastro.
- **CU-9 — Gestionar recursos:** en la sección de recursos del
  workspace o inline en la ficha; los recursos se crean sueltos o
  ya ligados, se comparten entre piezas y se listan con las
  piezas que sostienen.
  - Borde: quitar el soporte de una pieza ya aprobada exige actor
    de sesión; ligar sigue libre tras la puerta.
  - Borde: borrar un recurso elimina el documento con sus
    enlaces.

## Comportamiento esperado

- **Pipeline:** los estados son fijos —`propuesta`,
  `idea aprobada`, `en redacción`, `lista`— más `descartada`
  terminal; las transiciones inexistentes se rechazan.
- **Puertas:** solo un miembro con sesión confirma las dos
  aprobaciones, los retrocesos, las reaperturas, los descartes y
  quitar soporte de una pieza aprobada; el agente hace todo lo
  demás —crear, rellenar, ligar, empezar la redacción y
  escribir—.
- **Congelación:** los campos de la idea al aprobarla, el
  documento al aprobar el borrador; los recursos nunca se
  congelan.
- **Rastro:** toda transición y el alta de la pieza registran
  evento con el actor; retroceso, reapertura y descarte llevan su
  motivo.
- **Documentos:** cada documento del workspace lleva un tipo que
  gobierna su ciclo —`recurso`, `borrador`—; el borrador es uno
  por pieza.
- **Kanban:** cuatro columnas con tarjetas que muestran la
  madurez `n/4` servida por el servidor.

## Criterios de éxito

Una pieza real recorre el ciclo entero por la interfaz: el agente
la prepara y escribe, una persona aprueba las dos puertas, un
encuadre erróneo se corrige por retroceso conservando el texto y
una pieza muerta sale al archivo con su motivo y rastro intactos.

## Fuera de alcance

- Series (arcos editoriales), workflow configurable, calendario y
  notificaciones.
- Informe de revisión como entidad, comentarios anclados,
  versionado del borrador y brief (propuesta 003).
- Biblioteca de recursos con carga de archivos —el recurso es
  texto: título, nota y enlace—.
- Analítica de etapa y destinos de exportación.
