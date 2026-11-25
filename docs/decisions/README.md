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
- D003-spa-con-fallback-en-el-servidor.md
  - Disparadores: src/server/app.ts, src/web/routes.tsx, react-router, fallback, navegación, rutas
  - Resumen: SPA enrutado por el cliente con react-router; el servidor sirve index.html a las GET de navegación.
  - Estado: Aceptada
- D004-estilo-gobernado-por-guia.md
  - Disparadores: DESIGN.md, src/web/theme.css, src/web/app.css, tokens, variables CSS, guía de estilo
  - Resumen: Los valores visuales viven en DESIGN.md y se materializan en tokens :root; un literal fuera de ellos es deriva.
  - Estado: Aceptada
- D005-documentos-con-tipo.md
  - Disparadores: src/server/schema.ts, documento, recurso, borrador, tipo, pipeline editorial, propuestas 002 y 003
  - Resumen: Una única entidad documento con un tipo que declara su función y gobierna su ciclo de vida.
  - Estado: Aceptada
- D006-cliente-oficial-better-auth.md
  - Disparadores: src/web/auth-client.ts, src/web/session.tsx, useSession, signIn, signUp, signOut, /api/auth, cliente de autenticación
  - Resumen: La web consume better-auth solo por su cliente oficial; el atom de sesión compartido reemplaza las consultas por montaje.
  - Estado: Aceptada
