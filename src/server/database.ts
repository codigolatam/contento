import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import * as schema from "./schema";

export const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

export const createDatabase = (
  connectionString = process.env.DATABASE_URL,
  folder = migrationsFolder,
) => {
  if (connectionString) {
    const client = new Pool({ connectionString });
    const db = drizzlePg(client, { schema });
    return {
      db,
      execute: (query: string) => client.query(query),
      migrate: () => migratePg(db, { migrationsFolder: folder }),
      close: () => client.end(),
    };
  }

  const client = new PGlite();
  const db = drizzlePglite({ client, schema });
  return {
    db,
    execute: (query: string) => client.query(query),
    migrate: () => migratePglite(db, { migrationsFolder: folder }),
    close: () => client.close(),
  };
};
