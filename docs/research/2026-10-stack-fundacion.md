# Stack de la fundación: verificación de afirmaciones técnicas

## Fecha

2026-10

## Propósito

Verificar las afirmaciones técnicas de la propuesta 001 (better-auth, Hono, Drizzle y las alternativas descartadas) antes de refinarla en borradores, y registrar la evidencia que las sostiene o las corrige.

## Análisis

### Autenticación y tenancy: better-auth

- El plugin de organizaciones cubre la frontera de tenant (el workspace como organización), las invitaciones con expiración configurable y la pertenencia con varios roles. [1]
- Los roles por defecto son `owner`, `admin` y `member`. Los roles del dominio (autor, editor) no existen de serie: hay que definirlos con su control de acceso. [1][2]
- El plugin de API keys (`@better-auth/api-key`) soporta claves de usuario y claves de organización, con permisos por clave, expiración y límites de uso. [2][3]
- Las claves de organización se gobiernan con el RBAC del plugin de organizaciones: por defecto, solo el `owner` las gestiona. Hay que conceder el permiso `apiKey` a los roles que lo necesiten. [2]
- Auth.js lo mantiene desde septiembre de 2025 el equipo de Better Auth, que recomienda Better Auth para proyectos nuevos. [4]

### Frameworks: Hono y Drizzle

- Hono es MIT. Su adaptador para Node es `@hono/node-server` (MIT). El paquete sin scope `@honojs/node-server` está obsoleto y no debe usarse. [5]
- Los requisitos de Node no coinciden entre fuentes: el repositorio indica Node 20 o superior; la documentación de Hono indica 18.14.1 o superior. [5][6]
- Drizzle soporta PostgreSQL y SQLite (libsql, `node:sqlite`, better-sqlite3), y también PGlite. [7][8]
- Drizzle es específico de dialecto: los esquemas se escriben con `pg-core` o con `sqlite-core`. Por tanto, «SQLite en desarrollo y Postgres en producción» obliga a mantener dos esquemas o a aceptar diferencias entre motores. [7]
- PGlite es Postgres compilado a WASM que corre en Node sin servidor ni Docker. Drizzle lo usa con `drizzle-orm/pglite`, con el mismo esquema `pg-core` que en producción. [8]
- Better-auth soporta Postgres a través del adaptador de Drizzle (`provider: "pg"`) y, de forma independiente, a través de Kysely, que incluye PGlite como dialecto de comunidad. [9][10]

### Alternativas descartadas

- **Payload CMS.** Es MIT y gratuito. La v3 se instala dentro de la aplicación Next.js (admin y backend en `/app`) y se puede desplegar en contenedor. El acoplamiento a Next.js es real. La afirmación de que el ciclo de releases lo dicta Vercel no tiene evidencia y debe retirarse. [11][12]
- **Directus.** La propuesta cita la licencia BSL 1.1, que aplicaba desde v10 hasta v11. Desde v12 (mayo de 2026) el código se publica bajo MSCL, con un Innovation Grant para organizaciones por debajo de 5 M USD de ingresos y 50 empleados, y conversión a GPLv3 a los cuatro años. [13][14]
- **Clerk o Auth.js.** Auth.js ya no es una alternativa independiente: lo mantiene Better Auth. Clerk no se investigó en esta pasada.

## Evaluación comparativa

- **better-auth:** cubre tenancy, roles, invitaciones y claves por agente de serie, con configuración de roles necesaria.
- **Hono + Drizzle:** MIT, sin dependencia de un proveedor. El coste real está en el dialecto de Drizzle y en la versión de Node.
- **Payload:** cubre auth, roles y admin, pero el acoplamiento a Next.js es la razón de descarte que se sostiene.
- **Directus:** la licencia actual es más permisiva de lo que decía la propuesta. Sigue siendo válida la objeción de Flows para las puertas del pipeline, aunque no se verificó en esta pasada.

## Recomendación

Mantener el stack componible (Hono, Drizzle, better-auth) con un único esquema `pg-core`: Postgres en producción y PGlite en desarrollo y tests. Corregir la propuesta 001 en cuatro puntos:

1. Eliminar el argumento de Vercel en la alternativa de Payload y conservar el acoplamiento a Next.js.
2. Actualizar la licencia de Directus: BSL hasta v11 y MSCL desde v12.
3. Mencionar que Auth.js lo mantiene Better Auth.
4. Sustituir «SQLite en desarrollo» por PGlite en desarrollo y tests, con Postgres en producción.

Alternativas consideradas para la base de datos de desarrollo: Postgres en Docker (máxima fidelidad, coste de Docker) y SQLite también en producción (un solo esquema, pero abandona Postgres). Kysely y MikroORM son alternativas viables al ORM, con costes en tipos o en integración con better-auth.

## Prueba de concepto

Se validó con código desechable, fuera del repositorio, que el plan de persistencia y autenticación funciona. El código no forma parte del repositorio; estas instrucciones permiten reproducir la prueba.

### Resultados

- better-auth genera con su CLI un esquema `pg-core` con 8 tablas: `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation` y `apikey`.
- Drizzle Kit genera una migración a partir de ese esquema y se aplica sobre PGlite.
- Sobre PGlite, el flujo de organización y API key funciona: el creador de la organización tiene rol `owner`, y una API key creada para la organización se verifica y referencia esa organización.
- El mismo esquema y las mismas migraciones se aplican sobre Postgres 15 real, con el mismo resultado.

### Límites de la prueba

- No se probaron los roles autor y editor, las invitaciones ni el registro de eventos.
- Se usó Node 24.21.0. La documentación de Hono admite 18.14.1 o superior, y el repositorio de `@hono/node-server` pide 20 o superior.
- Se usó `@better-auth/cli@1.4.22` junto a `better-auth@1.7.14`. Conviene fijar ambas a la misma versión al crear el proyecto.
- Se usó Postgres 15. La versión 16 no se probó porque la descarga de su imagen falló.

### Reproducción

Requisitos: Node 24 (o 20 LTS), npm y Docker para la verificación contra Postgres.

1. Crear el directorio fuera del repositorio e instalar las dependencias:

   ```sh
   mkdir /tmp/spike-fundacion && cd /tmp/spike-fundacion && npm init -y
   npm pkg set type=module
   npm install better-auth@1.7.14 @better-auth/api-key@1.7.14 drizzle-orm@0.45.4 @electric-sql/pglite@0.5.13 pg tsx
   npm install -D drizzle-kit@0.31.11 @better-auth/cli@1.4.22
   ```

   No usar `npx auth`: resuelve a un paquete npm no relacionado. El CLI de better-auth es `@better-auth/cli`.

2. Crear `drizzle.config.ts`:

   ```ts
   import { defineConfig } from "drizzle-kit";

   export default defineConfig({
     out: "./drizzle",
     schema: "./src/schema.ts",
     dialect: "postgresql",
   });
   ```

3. Crear `src/db.ts`, que elige el driver según `DATABASE_URL`:

   ```ts
   import { PGlite } from "@electric-sql/pglite";
   import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
   import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
   import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
   import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
   import { Pool } from "pg";
   import * as schema from "./schema";

   const url = process.env.DATABASE_URL;
   const migrationsFolder = "./drizzle";

   export const client: any = url ? new Pool({ connectionString: url }) : new PGlite();
   export const db: any = url
     ? drizzlePg(client, { schema })
     : drizzlePglite({ client, schema });

   export const migrateDb = () =>
     url ? migratePg(db, { migrationsFolder }) : migratePglite(db, { migrationsFolder });
   ```

4. Crear `src/auth.ts`:

   ```ts
   import { betterAuth } from "better-auth";
   import { drizzleAdapter } from "better-auth/adapters/drizzle";
   import { organization } from "better-auth/plugins";
   import { apiKey } from "@better-auth/api-key";
   import { db } from "./db";

   export const auth = betterAuth({
     baseURL: "http://localhost:3000",
     secret: "spike-secret-spike-secret-spike-secret",
     database: drizzleAdapter(db, { provider: "pg" }),
     emailAndPassword: { enabled: true },
     plugins: [organization(), apiKey({ references: "organization" })],
   });
   ```

5. Generar el esquema de auth con el CLI. El aviso «Drizzle schema mismatch» que aparece antes de generar es esperado: indica que las tablas aún no existen.

   ```sh
   npx @better-auth/cli generate --config src/auth.ts --output src/schema.ts --yes
   ```

6. Generar la migración (crea `drizzle/`):

   ```sh
   npx drizzle-kit generate
   ```

7. Crear `src/smoke.ts`. Aplica las migraciones, registra un usuario, crea una organización y una API key para ella, verifica la clave y lista las tablas:

   ```ts
   import { db, client, migrateDb } from "./db";
   import { auth } from "./auth";

   await migrateDb();

   const signUp = await auth.api.signUpEmail({
     body: { email: "autor@spike.dev", password: "password-largo-123", name: "Autor" },
     returnHeaders: true,
   });
   const headers = new Headers({ cookie: signUp.headers.get("set-cookie") ?? "" });

   const org = await auth.api.createOrganization({
     body: { name: "Fronteando", slug: "fronteando" },
     headers,
   });
   console.log("organización:", org?.slug, "rol del creador:", org?.members?.[0]?.role);

   const key = await auth.api.createApiKey({
     body: { name: "agente-redactor", organizationId: org!.id, userId: signUp.response.user.id },
   });
   const verified = await auth.api.verifyApiKey({ body: { key: key.key } });
   console.log("api key válida:", verified.valid, "referencia a la org:", verified.key?.referenceId === org!.id);

   const tables = await client.query(
     "select table_name from information_schema.tables where table_schema='public' order by 1",
   );
   console.log("tablas:", tables.rows.map((r: { table_name: string }) => r.table_name).join(", "));

   await client.end?.();
   ```

8. Ejecutar sobre PGlite (sin variable de entorno):

   ```sh
   npx tsx src/smoke.ts
   ```

9. Levantar Postgres y ejecutar sobre él. Si `docker pull` falla por el credential helper de macOS, usar una imagen ya descargada en la máquina:

   ```sh
   docker run -d --name spike-pg -e POSTGRES_PASSWORD=spike -e POSTGRES_DB=spike -p 54329:5432 postgres:15-alpine
   DATABASE_URL=postgres://postgres:spike@localhost:54329/spike npx tsx src/smoke.ts
   ```

10. Resultado esperado en ambos casos:

    ```
    organización: fronteando rol del creador: owner
    api key válida: true referencia a la org: true
    tablas: account, apikey, invitation, member, organization, session, user, verification
    ```

11. Limpieza:

    ```sh
    docker rm -f spike-pg
    rm -rf /tmp/spike-fundacion
    ```

## Limitaciones

- No se verificó Clerk, ni las extensiones en Vue ni Flows de Directus.
- El texto completo de la MSCL no se leyó; la descripción se basa en el anuncio oficial de Directus.
- No se verificaron Prisma ni MikroORM en profundidad.
- El documento `docs/research/2026-10-gestores-del-trabajo-editorial.md` que cita el brief no está en el repositorio, así que no pudo consultarse.

## Referencias

- [1] better-auth, plugin de organizaciones: https://better-auth.com/docs/plugins/organization
- [2] better-auth, API key avanzado (permisos y claves de organización): https://better-auth.com/docs/plugins/api-key/advanced
- [3] better-auth, plugin de API keys: https://better-auth.com/docs/plugins/api-key
- [4] Better Auth, «Auth.js is now part of Better Auth» (22 de septiembre de 2025): https://better-auth.com/blog/authjs-joins-better-auth
- [5] Repositorio `honojs/node-server` (licencia MIT, requisitos de Node): https://github.com/honojs/node-server
- [6] Documentación de Hono, Node.js: https://hono.dev/docs/getting-started/nodejs
- [7] Drizzle ORM, visión general de SQLite y repositorio: https://orm.drizzle.team/docs/sqlite/overview y https://github.com/drizzle-team/drizzle-orm
- [8] Drizzle ORM, conexión con PGlite: https://orm.drizzle.team/docs/connect-pglite
- [9] Better Auth, adaptador de Drizzle: https://better-auth.com/docs/adapters/drizzle
- [10] Better Auth, otras bases de datos relacionales (dialectos de Kysely): https://better-auth.com/docs/adapters/other-relational-databases
- [11] Repositorio `payloadcms/payload` (licencia MIT): https://github.com/payloadcms/payload
- [12] Payload 3.0, anuncio de instalación en Next.js: https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app
- [13] Directus, «Evolving Our License for Long-Term Sustainability» (22 de abril de 2026): https://directus.com/resources/directus-v12-license-change
- [14] Directus, «Sustainable Open Source: Why We're Relicensing Directus» (BSL 1.1): https://directus.com/resources/why-we-are-relicensing-directus
