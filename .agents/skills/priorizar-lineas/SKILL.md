---
name: priorizar-lineas
description: >
  Compara las líneas de trabajo abiertas del proyecto evaluado
  —épicas, hitos ligeros y tareas sueltas— y produce escenarios
  de priorización completos: norte declarado por el usuario,
  tabla comparada con atributos relativos, confianza y factores
  de incertidumbre, dos o más planificaciones alternativas con
  sus implicaciones en beneficios y costes, y la decisión
  persistida con contexto y límites.
  Usar cuando haya que decidir el orden de varias líneas de
  trabajo, revisitar la prioridad con información nueva o
  comparar una línea nueva contra las abiertas.
  Sinónimos: priorizar líneas, ordenar líneas de trabajo,
  comparar líneas, escenarios de priorización, revisitar
  prioridad, decidir qué va primero.
---

# Priorizar líneas

Instrucciones para que un agente produzca escenarios de priorización de las líneas de trabajo abiertas del proyecto evaluado: declara el norte con el usuario, compara cada línea sobre los atributos del modelo con confianza e incertidumbre explícitas y compone dos o más planificaciones alternativas con sus implicaciones, para que el usuario elija y pula antes de fijar el orden —que nunca se aplica sin su confirmación—.

## Cuándo usar

- Cuando haya que decidir el orden de varias líneas de trabajo abiertas: en la planeación de dirección, al revisitar la prioridad con información nueva o al incorporar una demanda.
- Como paso del flujo de planeación de dirección y como invocación bajo demanda del usuario.

## Cuándo no usar

- Para ordenar las piezas dentro de un conjunto —tareas de una época o de un hito—: este nivel compara líneas enteras, no su descomposición.
- Cuando hay una sola línea abierta: no hay orden que decidir.
- Para reflejar en el índice un orden ya decidido: eso corresponde al reflector de la planeación de dirección.

## Entrada

- El disparador de la revisita: planeación de dirección, cierre de conjunto, incorporación de demanda o llamada directa. Se registra en el escenario.
- El norte del usuario: uno o dos temas que declara en el momento y guían la alineación de todas las líneas, no solo la cabeza del orden.
- Las líneas de trabajo abiertas del proyecto evaluado, obtenidas delegando la consulta «las líneas de trabajo abiertas» en `consultar-artefactos`: épicas con su estado, agrupaciones del índice y tareas sueltas.
- `references/modelo-comparacion.md`: los atributos, sus escalas, la confianza y la regla de escalación. Cargarlo antes de comparar.
- `assets/escenario.md`: la plantilla del escenario persistido.

## Salida

- Un escenario de priorización persistido en el directorio de priorizaciones del proyecto evaluado —la convención `dir_priorizaciones` (`docs/priorizaciones` por defecto)— con la serie numerada propia: norte declarado, disparador, comparación por línea con atributos, confianza y factores, las alternativas con sus implicaciones, el orden elegido y los límites de la decisión.
- El orden elegido, confirmado por el usuario, listo para que su consumidor lo aplique —la planeación de dirección lo materializa en el roadmap y el índice.
- O la revisita sin orden nuevo: la confirmación anotada en la sección «Confirmaciones» del escenario vigente cuando el usuario decide mantener el orden, el escenario mínimo cuando pospone, o la revisita registrada sin decisión nueva cuando rechaza las alternativas.

## Principios rectores

1. **Comparación relativa, nunca absoluta:** los atributos se estiman entre las líneas abiertas, no en unidades externas; el valor es del orden que producen, no de la cifra.
2. **Alternativas, nunca veredicto:** la salida son siempre dos o más planificaciones con implicaciones explícitas en beneficios y costes; el agente propone, no decide.
3. **Incertidumbre explícita:** cada puntuación lleva su confianza en escala cerrada y sus factores de incertidumbre; lo dudoso escala a revisión en lugar de ocultarse en la media.
4. **El norte guía el conjunto:** la directriz del usuario alinea todas las líneas —una línea desalineada con el norte declinado queda visible, no silenciosa—.
5. **Doble puerta humana:** el usuario elige entre alternativas y confirma la aplicación del orden; el rechazo es un resultado legítimo que también queda registrado.
6. **La decisión es auditable:** el escenario persistido conserva el contexto —qué se sabía, qué se comparó, qué se descartó y por qué— para revisar la decisión después, no solo el orden resultante.

## Procedimiento

1. **Declarar el disparador.** Registrar qué motiva la revisita —planeación de dirección, cierre de conjunto, incorporación de demanda o llamada directa—: se conserva en el escenario.
2. **Ofrecer la revisita cuando el disparador es un momento informativo.** Si la invocación llega del cierre de conjunto o de la incorporación de demanda —no de la llamada directa ni del paso de planeación de dirección—, proponer la revisita al usuario antes de comparar. Si acepta, continuar. Si el orden vigente sigue sirviendo, anotar la confirmación como línea append-only en la sección «Confirmaciones» del escenario vigente —el último de la serie de priorizaciones— con la forma «fecha — disparador: orden vigente confirmado», y terminar; sin escenario previo no hay decisión que confirmar: informar sin escribir. Si pospone, persistir el escenario mínimo —disparador, fecha y decisión «revisita pospuesta» con el motivo, sin norte ni comparación— siguiendo el paso 10 y terminar.
3. **Reunir las líneas** delegando «las líneas de trabajo abiertas» en `consultar-artefactos`. Si hay una sola, informar de que no hay orden que decidir y terminar.
4. **Leer el contenido real de cada línea:** el objetivo y el plan técnico de las épicas y las tareas sueltas, buscando las interacciones —qué línea habilita o encarece a otra— que alimentan los atributos.
5. **Pedir el norte al usuario:** uno o dos temas-norte del momento. Sin norte declarado no se compara: el norte es el eje que alinea la comparación, no un dato inferible.
6. **Comparar cada línea** sobre los atributos del modelo —valor, criticidad temporal, habilitación/riesgo y tamaño— estimados relativamente entre las líneas, con su confianza y sus factores de incertidumbre por línea. Cargar `references/modelo-comparacion.md` antes de puntuar.
7. **Escalar los puntos dudosos:** toda línea con confianza baja o tres o más factores de incertidumbre se presenta al usuario para revisión explícita antes de componer alternativas —el usuario confirma la estimación o la corrige—.
8. **Componer dos o más planificaciones alternativas** del orden, cada una con sus implicaciones: qué beneficios adelanta y qué costes acepta —qué decae por esperar, qué queda desbloqueado antes o después—. Las alternativas difieren en un criterio legible —por ejemplo, la que maximiza valor inmediato frente a la que desbloquea antes el resto—.
9. **Presentar las alternativas al usuario** con la comparación completa. El usuario elige una y la pule si quiere —ajustar puntuaciones o el orden propuesto— o rechaza todas: en ese caso el orden queda como estaba y se registra la revisita sin decisión nueva.
10. **Persistir el escenario** con la plantilla `assets/escenario.md` en el directorio de priorizaciones —si no existe, crearlo y empezar por el primer número de la serie— con el nombre `NNN-slug.md`: el identificador emitido por «el siguiente número de la serie» de `consultar-artefactos`, un guion y un slug en kebab-case del norte declarado —con dos temas, el principal o ambos concatenados; en una posposición sin norte, del disparador—; la serie distingue revisitas con el mismo nombre. Contenido: disparador, norte, comparación, alternativas, orden elegido o revisita pospuesta, y los límites de la decisión. Antes de escribirlo, aplicar revisión de redacción y pulido mecánico en modo preventivo —`revisar-redaccion` y `pulir-escritura` si el arnés lo permite, el equivalente manual en caso contrario—.
11. **Confirmar la aplicación:** con el orden elegido y el escenario persistido, pedir confirmación para aplicarlo —quien invocó decide qué hacer con él: la planeación de dirección lo materializa en el roadmap y el índice; la llamada directa lo deja como decisión registrada—.
12. **Informar** del escenario persistido y del orden resultante —o de la revisita pospuesta—.

## Finalización

El skill ha terminado cuando ocurre una de estas dos cosas:

- El escenario quedó persistido con el orden elegido, confirmado para su aplicación por el invocador.
- La revisita quedó resuelta sin orden nuevo: el usuario confirmó el orden vigente y la anotación quedó en el escenario vigente, pospuso y su escenario mínimo quedó persistido, o rechazó las alternativas y la revisita quedó registrada; o se informó de que no hay orden que decidir.

## Referencias

- `references/modelo-comparacion.md` — Los atributos, sus escalas, la confianza y la regla de escalación. Leer antes de comparar.
- `assets/escenario.md` — Plantilla del escenario persistido. Leer antes de escribirlo.
- `docs/decisions/D036-priorizacion-por-escenarios-comparados.md` — La decisión que este skill materializa.
- `docs/research/2026-10-metodos-priorizacion-lineas.md` — La investigación que fundamenta el modelo.
