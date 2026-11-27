# Lecciones

Notas de lecciones aprendidas de las correcciones del usuario. Cada tema es un archivo; las lecciones se derivan del registro `EXPERIENCIAS.md`, que es la evidencia.

<!-- Formato de cada entrada:
     - <archivo>
       - Disparadores: archivos, comandos y palabras clave que hacen aplicable la lección
       - Resumen: una frase -->

- convenciones-de-codigo.md
  - Disparadores: src/, *.test., mensajes de error
  - Resumen: El código, las pruebas y los mensajes de error van en inglés.
- pruebas.md
  - Disparadores: *.test., vitest.config, coverage, DATABASE_URL, Docker, servicios externos
  - Resumen: Las pruebas se diseñan con ZOMBIE, se revisan antes de presentarse y se entregan con 100% de cobertura. Lo que depende de servicios externos se verifica manualmente, fuera de la suite.
- documentacion-de-producto.md
  - Disparadores: README.md, product-docs/
  - Resumen: La documentación de producto no menciona tareas.
- diseno-visual.md
  - Disparadores: src/web/, *.css, DESIGN.md, tokens, breakpoint, captura, Firefox
  - Resumen: Los valores estéticos se razonan por proporción chrome/contenido y se validan renderizados; los defaults convencionales no sustituyen la evidencia.
- semantica-del-dominio.md
  - Disparadores: documento, recurso, enlace, link, pipeline editorial, src/server/schema.ts, migraciones
  - Resumen: Las palabras ambiguas del dominio no se materializan como campos técnicos sin confirmar su referente.
- identidad-humana-del-dominio.md
  - Disparadores: src/server/schema.ts, kanban, tarjeta, creación, UX, identificador, null, título, tema
  - Resumen: Las entidades visibles necesitan un identificador humano obligatorio desde su creación.
