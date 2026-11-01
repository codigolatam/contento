# Pruebas

## Lecciones

- **Diseña las pruebas con ZOMBIE antes de presentarlas.** Cubre las seis letras, usa nombres que describan el comportamiento, aserciones precisas y aislamiento del entorno. Revisa también que cada prueba falle cuando el código esté mal.
  Disparadores: *.test., vitest.config
  Origen: 20261030T230832

- **Las verificaciones que dependen de servicios externos no quedan en la suite.** Se ejecutan manualmente durante la tarea y su resultado se registra en el archivo de la tarea. La suite permanente solo contiene lo que `npm test` puede ejecutar en cualquier máquina.
  Disparadores: *.test., DATABASE_URL, Docker, servicios externos
  Origen: 20261101T134541
