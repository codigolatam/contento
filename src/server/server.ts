import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import { createApp } from "./app";
import { createAuth, mountAuth } from "./auth";
import { createDatabase, migrationsFolder } from "./database";

const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (!/^\d+$/.test(rawPort) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${rawPort}`);
}

const pgliteDataDir =
  process.env.PGLITE_DATA_DIR ?? fileURLToPath(new URL("../../.pglite-data", import.meta.url));

const database = createDatabase(process.env.DATABASE_URL, migrationsFolder, pgliteDataDir);
await database.migrate();

const app = createApp();
mountAuth(app, createAuth(database));

serve({ fetch: app.fetch, port });
