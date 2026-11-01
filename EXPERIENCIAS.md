# Experiencias

<!-- Registro append-only de las correcciones que el usuario hace al agente
     durante la ejecución de tareas. Cada entrada documenta la brecha entre
     el resultado esperado y el obtenido.

     Las entradas nunca se editan ni se borran. Gestionado por el skill
     destilar-lecciones. -->

- Id: 20261030T230831
  Tarea: docs/tasks/001-scaffold.md
  Esperado: El código, los identificadores, los nombres de las pruebas y los mensajes de error están en inglés.
  Obtenido: Los mensajes de error y los nombres de las pruebas estaban en español.
  Corrección: Usar inglés para el código, incluidos los nombres de las pruebas y los mensajes de error.
  Estado: consolidada

- Id: 20261030T230832
  Tarea: docs/tasks/001-scaffold.md
  Esperado: Las pruebas se revisan contra ZOMBIE y las buenas prácticas antes de presentarse.
  Obtenido: Las pruebas cubrían parcialmente ZOMBIE, tenían aserciones débiles y dejaban pasar un PORT inválido.
  Corrección: Revisar las pruebas contra ZOMBIE y las buenas prácticas antes de dar la tarea por lista.
  Estado: consolidada

- Id: 20261030T230833
  Tarea: docs/tasks/001-scaffold.md
  Esperado: El README describe el estado del repositorio sin referencias a tareas.
  Obtenido: La nota de estado del README mencionaba la tarea 001.
  Corrección: No mencionar tareas en la documentación de producto; la trazabilidad vive en el índice y en el archivo de la tarea.
  Estado: consolidada

- Id: 20261101T134541
  Tarea: docs/tasks/002-persistencia.md
  Esperado: Las pruebas permanentes solo contienen lo que `npm test` puede ejecutar en cualquier máquina.
  Obtenido: La propuesta incluía una prueba contra Postgres real guardada en el repositorio.
  Corrección: Las verificaciones que dependen de servicios externos se ejecutan manualmente durante la tarea y su resultado se registra en el archivo, sin quedar en la suite.
  Estado: consolidada
