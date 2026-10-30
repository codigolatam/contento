---
name: planificar-roadmap
description: >
  Produce el roadmap del producto: el documento que declara las
  líneas de trabajo —épicas, hitos ligeros y tareas sueltas—
  organizadas en horizontes de confianza (Now, Next, Later,
  No ahora), con el orden de los comprometidos salido de
  escenarios de priorización decididos y su justificación de
  posición, y refleja esos horizontes en el índice de tareas.
  Es el nivel por encima de la épica: decide dirección y
  prioridad, no estado.
  Usar cuando haya que ordenar varias líneas de trabajo abiertas,
  posicionar trabajo suelto respecto a las épicas, o revisar la
  dirección del producto.
  Sinónimos: planear roadmap, planificar roadmap, crear roadmap,
  ordenar líneas de trabajo, secuenciar épicas, priorizar trabajo.
---

# Planificar roadmap

Instrucciones para que un agente produzca el roadmap de un producto: el documento —ubicado según la convención `archivo_roadmap`, en la raíz del repositorio por defecto— que declara las líneas de trabajo abiertas organizadas en horizontes de confianza —Now (comprometido y en vuelo), Next (validado y próximo), Later (dirección sin compromiso) y No ahora (aparcado con su razón)—, con justificación de posición dentro de Now y Next. Es el nivel por encima de la épica: donde la épica da objetivo y guía a un conjunto, el roadmap decide qué conjunto —y qué trabajo suelto— va primero y por qué. El orden de las líneas comprometidas sale de escenarios de priorización comparados que el usuario decide —producidos por `priorizar-lineas` dentro del propio flujo—, no del orden de inserción.

## Cuándo usar

- Cuando el producto tiene varias líneas de trabajo abiertas —épicas planificadas, hitos ligeros, tareas sueltas— sin orden ni dirección declarados.
- Cuando aparece una línea nueva o se cierra una existente y hay que replantear el orden.
- Cuando una decisión cambia el costo relativo entre líneas —por ejemplo, un refactor transversal cuya posición altera el costo de las demás— y el orden declarado hay que revisarlo.
- Cuando `mantener-roadmap` detecta divergencia de dirección al reflejar la ejecución —un horizonte comprometido agotado con sucesores esperando, trabajo comprometido sin línea en el roadmap, una épica completada aún listada—: la replanificación es suya y la puerta humana sigue decidiendo la dirección.

## Cuándo no usar

- Para ordenar las tareas dentro de un conjunto: eso es el plan técnico de la épica, producido por `planificar`.
- Para una sola línea de trabajo: sin varias líneas no hay orden que decidir.
- Para ejecutar el trabajo ordenado: eso corresponde a `ejecutar-tareas` sobre el índice de tareas.
- Para registrar dependencias duras entre tareas: eso es la declaración de bloqueo del índice; el roadmap declara orden preferente justificado, no bloqueos.

## Entrada

- La visión o documento de dirección del producto, si existe, como ancla de la trazabilidad.
- El inventario de líneas de trabajo abiertas del proyecto —épicas planificadas, hitos ligeros y tareas sueltas pendientes—, que `consultar-artefactos` produce sin que el consumidor nombre las ubicaciones.
- `assets/roadmap.md` como plantilla del documento.

## Salida

- El documento de roadmap en la ubicación de la convención `archivo_roadmap`, con las líneas asignadas a su horizonte, la justificación de cada posición en Now y Next —junto a los atributos comparados y el escenario que decidió cada posición— y estado por línea en Now. Es un documento vivo único: se actualiza in situ y su historia la preserva git; no hay serie de roadmaps ni fechas comprometidas.
- El escenario de priorización persistido que decidió el orden —o la revisita registrada sin orden nuevo cuando el usuario rechaza o pospone las alternativas—. Lo produce `priorizar-lineas`, invocado dentro del flujo.
- El índice de tareas reflejando los horizontes comprometidos: las líneas de Now y Next aparecen en el índice reordenadas si divergían, sin tocar el estado de ninguna tarea. Later y No ahora viven solo en el roadmap, su hogar natural como documento de dirección; una propuesta en revisión del índice no es una línea del roadmap hasta que se aprueba y planifica.

## Principios rectores

1. **El roadmap decide, el índice ejecuta:** el roadmap es la fuente de verdad de prioridad y dirección; el índice de tareas es la fuente de verdad de ejecución y estado. El índice refleja mecánicamente los horizontes comprometidos (Now y Next), igual que la agrupación por hitos lo es de la épica; Later y No ahora no tienen reflejo en el índice.
2. **Horizontes de confianza, no fechas:** cada línea declara su nivel de compromiso —Now acotado (3-5 líneas) y con estado, Next próximo, Later dirección sin orden interno, No ahora aparcado con razón— porque la confianza comunica más honestidad que una secuencia única y da hogar a lo descartado sin perderlo.
3. **Orden decidido por comparación, no por inserción:** el orden de Now y Next sale del escenario de priorización que `priorizar-lineas` produce dentro del flujo; cada línea declara los atributos comparados y el escenario que fijó su posición, y la justificación sigue dando la razón —impacto sobre otras líneas, dependencias, costo evitado— porque es lo que comunica los efectos cruzados y lo que permite revisar el orden cuando cambian las condiciones.
4. **Orden preferente, no bloqueo:** el roadmap posiciona líneas por conveniencia; si una línea no puede empezar sin otra, la dependencia se declara como bloqueo en el índice, no como posición en el roadmap.
5. **Planear sobre líneas reales:** horizonte y orden se deciden leyendo las épicas y las tareas tal como están escritas —sus planes técnicos declaran las interacciones—, no sobre títulos abstractos.
6. **Puerta humana:** el borrador del roadmap se presenta al usuario antes de crear el archivo; la dirección del producto no se considera decidida sin esa aprobación.
7. **Absorbe trabajo suelto:** las líneas no son solo épicas; una tarea suelta o un hito ligero también se posiciona, con la misma justificación.

## Procedimiento

### 1. Reunir las líneas

1. **Inventariar las líneas de trabajo abiertas** delegando la consulta «las líneas de trabajo abiertas» en `consultar-artefactos`, que devuelve las épicas con su estado, las agrupaciones del índice —con o sin épica enlazada— y las tareas sueltas no completadas.
2. **Leer el contenido real de cada línea:** los planes técnicos de las épicas y los objetivos de las tareas sueltas, buscando las interacciones —qué línea cambia el costo de qué otra, qué formato o estructura asume una forma del sistema que otra línea todavía puede alterar.
3. **Si hay una sola línea abierta**, informar de que no hay orden que decidir y terminar sin crear el documento.

### 2. Priorizar las líneas

4. **Invocar `priorizar-lineas` con el disparador «planeación de dirección»:** la comparación es suya por entero —reúne las líneas, pide el norte al usuario, estima los atributos con confianza e incertidumbre, escala los puntos dudosos, presenta las planificaciones alternativas con sus implicaciones y persiste el escenario tras la elección—; el consumidor no replica ninguno de esos pasos.
5. **Tomar el orden del escenario como la secuencia de las líneas comprometidas.** Con el orden elegido y confirmado para su aplicación, continuar; si el usuario rechazó o pospuso las alternativas, la secuencia vigente se conserva —la revisita quedó registrada en el escenario— y el borrador se redacta con ella; en un primer roadmap, sin orden previo que conservar, se redacta con la de recogida.

### 3. Redactar el borrador

6. **Asignar cada línea a su horizonte** según el nivel de compromiso: Now para lo decidido y en vuelo (3-5 líneas, con estado), Next para lo validado que sigue, Later para la dirección sin compromiso (temas sin orden) y No ahora para lo aparcado, con la razón. Las propuestas en revisión del índice no entran: una propuesta no es línea hasta que se aprueba y planifica.
7. **Distribuir el orden decidido en Now y Next:** los primeros puestos de la secuencia van a Now —acotado a 3-5 líneas— y los siguientes a Next. Redactar la justificación de cada posición —qué la hace conveniente ahí y qué pasaría si ocupara otra— y declarar por línea los atributos que la comparación estimó y el escenario que fijó su posición. Later se agrupa por tema sin orden interno ni comparación.
8. **Redactar la dirección** a partir de la visión del producto: el objetivo que este conjunto de líneas sirve; toda línea del documento debe remitir a ella.
9. **Aplicar revisión de redacción y pulido mecánico en modo preventivo.** Si el arnés lo permite, invocar `revisar-redaccion` y, con su salida, `pulir-escritura`; de lo contrario, realizar el equivalente manualmente.

### 4. Puerta humana

10. **Presentar el borrador al usuario** para aprobación, con los horizontes, el orden y sus justificaciones. Si solicita cambios, ajustar y repetir. Si lo rechaza, no crear el archivo y terminar.

### 5. Materializar el roadmap

11. **Crear o actualizar el documento de roadmap** en la ubicación de la convención `archivo_roadmap` (`ROADMAP.md` por defecto) siguiendo `assets/roadmap.md`, registrando la aprobación en su sección de revisión con la acción «registrar el veredicto» de `actualizar-artefactos`. El documento es vivo: una dirección nueva se escribe sobre la anterior, cuya historia queda en git.
12. **Reflejar los horizontes comprometidos en el índice:** recolocar las agrupaciones y las tareas sueltas para que el orden del índice coincida con el declarado en Now y Next, componiendo la reordenación con la acción «recolocar» de `actualizar-artefactos`, que mueve bloques sin tocar el estado de ninguna tarea. Later y No ahora no aparecen en el índice. Si el índice ya coincide, no tocarlo.
13. **Informar al usuario** del roadmap producido y del orden reflejado en el índice.

## Finalización

El skill ha terminado cuando:

- El escenario de la revisita quedó persistido —con el orden elegido o registrado sin orden nuevo— y el usuario aprobó los horizontes, el orden y las justificaciones.
- El documento de roadmap existe en su ubicación con las líneas asignadas a su horizonte y justificadas en Now y Next, que declaran los atributos comparados y el escenario de cada posición.
- El índice de tareas refleja Now y Next sin cambios de estado.

## Referencias

- `assets/roadmap.md` — Plantilla del documento de roadmap. Leer antes de redactar el borrador.
- `.agents/skills/priorizar-lineas/SKILL.md` — La comparación de líneas invocada en el paso de priorización.
- `docs/decisions/D036-priorizacion-por-escenarios-comparados.md` — La decisión que fija la comparación por escenarios como fuente del orden.
- `docs/decisions/D022-roadmap-como-nivel-de-direccion.md` — El roadmap como artefacto de dirección y su relación con el índice.
- `docs/research/2026-09-documentacion-producto-y-roadmap.md` — El patrón Now/Next/Later, los límites por horizonte y el «No ahora».
- `docs/decisions/D019-epica-como-artefacto-de-planeacion.md` — El nivel inmediatamente inferior y la relación artefacto↔índice que este nivel replica.
