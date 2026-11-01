import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Hono } from "hono";
import { createDatabase } from "./database";

type Database = ReturnType<typeof createDatabase>;

export const createAuth = (database: Database) =>
  betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(database.db, { provider: "pg" }),
    emailAndPassword: { enabled: true },
  });

export const auth = createAuth(createDatabase("", undefined, undefined));

export const mountAuth = (app: Hono, authInstance: ReturnType<typeof createAuth>) => {
  app.on(["POST", "GET"], "/api/auth/*", (c) => authInstance.handler(c.req.raw));
  app.get("/api/me", async (c) => {
    const session = await authInstance.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: "unauthorized" }, 401);
    }
    return c.json({ email: session.user.email });
  });
};
