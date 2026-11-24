# Escenario de priorización — Acceso antes que pipeline

- **Disparador:** incorporación de demanda
- **Norte:** producto usable pronto
- **Fecha:** 2026-11-23

## Comparación

- 009 — Pantalla de acceso: registro y entrada (tarea suelta)
  - Valor: 5 — sin login ninguna superficie humana es usable; es
    el umbral de «usable» para el norte.
  - Criticidad temporal: 1 — nada decae si espera.
  - Habilitación/riesgo: 8 — desbloquea la tarea 014 y toda
    superficie dirigida a personas del Hito 2; declarado en la
    propia tarea y en las dependencias de 014.
  - Tamaño: 2 — ~1-2 días; la API de autenticación ya está
    montada, queda solo la superficie, la cookie y la
    redirección.
  - Confianza: alta.
  - Factores de incertidumbre: ninguno.
- Hito 2 — Pipeline editorial con puertas (épica, 5 tareas)
  - Valor: 8 — es el producto mismo, pero su valor aterriza
    después.
  - Criticidad temporal: 2 — el pipeline espera pero no pierde
    valor por ello.
  - Habilitación/riesgo: 1 — ninguna línea abierta depende de
    ella.
  - Tamaño: 8 — cinco piezas, ~10-15 días estimados en la
    revisión de granularidad.
  - Confianza: media (tamaño: estimaciones de la revisión de
    granularidad no verificadas; la resolución de actor es
    terreno nuevo).
  - Factores de incertidumbre: tamaño estimado sin verificar;
    infraestructura de actor sin precedente en el código.

## Alternativas

### A — Usable primero

009 → Hito 2 — implicaciones: la puerta de entrada humana existe
antes de cualquier superficie y 014 nunca espera; a cambio, 010
—que no necesita 009— arranca ~2 días más tarde.

### B — Dominio primero, acceso justo a tiempo

Hito 2 por 010 → 009 antes de 014 — implicaciones: el dominio se
construye ya explotando la dependencia real (solo 014 necesita el
login); a cambio, nada usable llega antes —010 es invisible para
el usuario— y si 009 se desliza, 014 espera con el kanban ya
codificado.

## Decisión

Alternativa A: 009 primero, luego el Hito 2 — el orden vigente
del índice queda confirmado y no requiere recolocación.

## Límites de la decisión

El tamaño del Hito 2 descansa en estimaciones de la revisión de
granularidad no verificadas contra ejecución real; la resolución
de actor (sesión/clave hacia workspace) es terreno nuevo y puede
reventar la estimación de 010. Conviene revisitar el orden al
cerrar 009 o si 010 revela que el coste del actor supera lo
estimado.

## Confirmaciones

