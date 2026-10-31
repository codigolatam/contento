import { fileURLToPath } from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

export const defaultWebRoot = fileURLToPath(new URL("../../dist", import.meta.url));

export const createApp = (webRoot = defaultWebRoot) => {
  const app = new Hono();
  app.get("/health", (c) => c.json({ status: "ok" }));
  app.get("/", serveStatic({ root: webRoot, path: "index.html" }));
  app.use("/*", serveStatic({ root: webRoot }));
  return app;
};
