# Modelo de comparación de líneas

El modelo que `priorizar-lineas` aplica al comparar las líneas de trabajo abiertas. Las estimaciones son siempre relativas entre las líneas presentes —una línea respecto a las demás, nunca contra unidades absolutas— porque el valor está en el orden que producen, no en la cifra.

## Atributos

Cuatro atributos por línea, todos obligatorios:

- **Valor:** qué mejora o habilita en el producto esta línea respecto a las demás —beneficio para el usuario del producto, avance de la dirección declarada.
- **Criticidad temporal:** qué decae si la línea espera —valor que se pierde por retraso, ventanas que se cierran, trabajo que se hace más caro con el tiempo. Una línea sin presión temporal puntúa bajo aquí y eso es legítimo.
- **Habilitación/riesgo:** qué desbloquea de las demás o qué riesgo reduce —una línea que abre el camino a otras, o que elimina una incertidumbre que las frena, pesa más que su beneficio propio.
- **Tamaño:** el esfuerzo relativo de la línea frente a las demás —el divisor del coste de demora: a igual valor, la línea pequeña va antes.

Los tres primeros componen el coste de demora adaptado (WSJF relativo); el tamaño lo divide. La comparación no produce una fórmula cerrada: la tabla muestra cada atributo por línea y la razón de la estimación, para que el usuario discuta estimaciones concretas en lugar de un número opaco.

## Escala de estimación

Relativa entre las líneas abiertas: cada atributo se puntúa comparando —«esta línea vale más que aquella porque…»—, nunca midiendo en unidades. La escala concreta la elige el ejecutor y la declara en el escenario (una práctica habitual es Fibonacci modificado); lo contractual es la relatividad y la razón escrita por estimación.

## Confianza

Cada estimación lleva su confianza en escala cerrada:

- **Alta:** la estimación descansa en evidencia del propio repositorio —planes, épicas, estado—.
- **Media:** la estimación razona sobre lo conocido pero con supuestos no verificados.
- **Baja:** la estimación depende de información que falta o es volátil.

La confianza se estima por atributo; en la comparación del escenario se registra la menor de la línea, nombrando el atributo afectado cuando no es alta.

## Factores de incertidumbre

Por línea, la lista de lo que podría cambiar la estimación: dependencias no confirmadas, alcance difuso, coste desconocido, supuestos sobre otras líneas. La lista es abierta.

## Regla de escalación

Un punto escala a revisión explícita del usuario —se presenta y se confirma o corrige antes de componer alternativas— cuando la línea tiene confianza **baja** en algún atributo o acumula **tres o más factores** de incertidumbre.
