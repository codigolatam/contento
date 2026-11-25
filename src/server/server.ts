import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { createAuth, mountAuth } from "./auth";
import { createDatabase, migrationsFolder } from "./database";
import { resolveDataDir } from "./data-dir";

const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);

if (!/^\d+$/.test(rawPort) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${rawPort}`);
}

const pgliteDataDir = resolveDataDir(process.env);

const database = createDatabase(process.env.DATABASE_URL, migrationsFolder, pgliteDataDir);
await database.migrate();

const app = createApp();
mountAuth(app, createAuth(database));

serve({ fetch: app.fetch, port });
