# Decisiones

Registro de las decisiones de diseño que dan forma al proyecto. Cada decisión es un archivo numerado e inmutable: si cambia, se marca como sustituida y se enlaza la nueva.

<!-- Formato de cada entrada:
     - <archivo>
       - Disparadores: archivos, artefactos y palabras clave que hacen aplicable la decisión
       - Resumen: una frase
       - Estado: Aceptada | Sustituida por DNNN | Obsoleta -->

- D001-stack-componible.md
  - Disparadores: package.json, src/server, src/web, hono, drizzle, better-auth, stack, ORM, autenticación
  - Resumen: Servidor Hono, ORM Drizzle, cuentas y workspaces con better-auth y web React.
  - Estado: Aceptada
- D002-pglite-desarrollo-postgres-produccion.md
  - Disparadores: drizzle.config.ts, src/db.ts, drizzle, pglite, postgres, migraciones, esquema
  - Resumen: Un único esquema pg-core: PGlite en desarrollo y tests, Postgres en producción.
  - Estado: Aceptada
