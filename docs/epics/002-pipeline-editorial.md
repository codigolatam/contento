# Pipeline editorial con puertas

## Estado

[x] Planificada | [ ] Completada

## Objetivo

Una pieza puede recorrer el pipeline `propuesta → idea aprobada →
en redacción → lista` con puertas humanas verificables,
retrocesos con motivo, descarte terminal con archivo consultable
y documentos del workspace (`recurso`, `borrador`) compartidos;
toda transición queda registrada con su actor.

## Alcance

- **Dentro:** la resolución de actor (sesión o clave de API hacia
  workspace), el modelo pieza/documento/enlace, las dos puertas
  humanas con congelación, los retrocesos y la reapertura con
  descongelado, el descarte terminal con su vista de archivo, el
  kanban, la ficha de maduración, la vista de redacción y la
  sección de recursos del workspace.
- **Fuera:** series (arcos editoriales), workflow configurable,
  informe de revisión como entidad, versionado del borrador y
  brief (propuesta 003), biblioteca de recursos con carga de
  archivos, exportación a destinos y la pantalla de acceso
  (tarea 009, previa).

## Piezas

- [ ] docs/tasks/010-modelo-y-api-pipeline.md — Modelo y API del
  pipeline editorial
- [ ] docs/tasks/014-kanban-y-ficha.md — Kanban del pipeline y
  ficha de maduración
- [ ] docs/tasks/011-escribir-el-borrador.md — Escribir el
  borrador: de `idea aprobada` a `lista`
- [ ] docs/tasks/012-retroceso-y-descarte.md — Retroceso,
  reapertura y descarte
- [ ] docs/tasks/013-seccion-recursos.md — Sección de recursos
  del workspace

## Plan técnico

- **Orden:** 010 → {014, 013} → 011 → 012. La tarea 013 corre en
  paralelo con 014 tras la API; 009 es prerrequisito previo de
  las superficies (014).
- **Dependencias:** 010 sienta la resolución de actor, el modelo
  y la primera puerta; 014 monta la primera superficie con datos
  sobre esa API; 011 reutiliza la ficha congelada en la vista de
  redacción; 012 cierra los movimientos hacia atrás y expone el
  rastro de eventos por HTTP; 013 solo necesita la API de
  recursos y enlaces.
- **Decisiones transversales (ya tomadas):**
  - La resolución de actor —persona por sesión o agente por clave
    de API, ambas hacia workspace— es infraestructura transversal
    que nace en 010; todas las rutas de dominio se montan sobre
    ella.
  - El `documento` lleva un `tipo` (`recurso`, `borrador`) que
    gobierna su ciclo; diseñado pensando en el versionado que la
    propuesta 003 añadirá.
  - El enum de estados incluye `descartada` desde el principio.
  - La ficha en `propuesta` es la pantalla de maduración.
  - Congelación: los campos al aprobar la idea, el documento al
    aprobar el borrador; los recursos nunca se congelan.
  - Puertas y movimientos hacia atrás o descarte: solo actor de
    sesión (cualquier miembro del workspace; `403` a clave de
    API). Todo lo demás lo puede hacer el agente.
  - Cada transición y el alta registran evento con actor;
    retroceso, reapertura y descarte llevan motivo.
  - `empezar_redaccion` es idempotente y solo opera desde
    `idea aprobada`.
  - La madurez `n/4` la calcula el servidor.
  - El editor del borrador es un `textarea` plano.

## Criterio de cierre

Las cinco tareas completadas. Una pieza real recorre el ciclo
entero por la interfaz y por la API: el agente la prepara y la
escribe, la persona aprueba ambas puertas, un encuadre erróneo se
corrige por retroceso conservando el texto, una `lista` se reabre
para una errata y una pieza muerta sale al archivo con su motivo
y rastro; los recursos se comparten entre piezas desde la
sección.

## Revisión

- Usuario: 2026-11-23 — Aprueba
