import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

export const defaultWebRoot = fileURLToPath(new URL("../../dist", import.meta.url));

const isNavigationPath = (url: string) => {
  let path: string;
  try {
    path = decodeURIComponent(new URL(url).pathname);
  } catch {
    return false;
  }
  return path !== "/api" && !path.startsWith("/api/") && !path.includes("..") && extname(path) === "";
};

export const createApp = (webRoot = defaultWebRoot) => {
  const app = new Hono();
  const index = serveStatic({ root: webRoot, path: "index.html" });
  app.get("/health", (c) => c.json({ status: "ok" }));
  app.get("/", index);
  app.use("/*", serveStatic({ root: webRoot }));
  app.get("*", (c, next) => {
    if (!isNavigationPath(c.req.url)) return next();
    return index(c, next);
  });
  return app;
};
