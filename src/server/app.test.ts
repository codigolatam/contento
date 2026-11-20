import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "./app";

describe("createApp", () => {
  let workDir: string;
  let webRoot: string;
  let emptyWebRoot: string;

  beforeAll(async () => {
    workDir = await mkdtemp(join(tmpdir(), "contento-"));
    webRoot = join(workDir, "web");
    emptyWebRoot = join(workDir, "empty");

    await mkdir(webRoot);
    await mkdir(emptyWebRoot);
    await writeFile(join(webRoot, "index.html"), "<h1>Contento</h1>");
    await writeFile(join(webRoot, "app.js"), "console.log('contento');");
    await writeFile(join(webRoot, "style.css"), "body {}");
    await writeFile(join(workDir, "secret.txt"), "not for the web");
  });

  afterAll(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  describe("health endpoint", () => {
    it("returns 200 with an ok status payload", async () => {
      const res = await createApp(webRoot).request("/health");

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("application/json");
      expect(await res.json()).toEqual({ status: "ok" });
    });
  });

  describe("static web", () => {
    it("serves index.html at the root path", async () => {
      const res = await createApp(webRoot).request("/");

      expect(res.status).toBe(200);
      expect(await res.text()).toBe("<h1>Contento</h1>");
    });

    it("serves every file in the web root", async () => {
      const app = createApp(webRoot);

      const script = await app.request("/app.js");
      const stylesheet = await app.request("/style.css");

      expect(script.status).toBe(200);
      expect(await script.text()).toBe("console.log('contento');");
      expect(stylesheet.status).toBe(200);
      expect(await stylesheet.text()).toBe("body {}");
    });

    it("returns 404 for the root path when the web root is empty", async () => {
      const res = await createApp(emptyWebRoot).request("/");

      expect(res.status).toBe(404);
    });

    it.each(["/..%2fsecret.txt", "/%2e%2e%2fsecret.txt", "/..%5csecret.txt"])(
      "does not serve files outside the web root for the encoded traversal path %s",
      async (path) => {
        const secret = await readFile(join(workDir, "secret.txt"), "utf8");
        const res = await createApp(webRoot).request(path);

        expect(secret).toBe("not for the web");
        expect(res.status).toBe(404);
        expect(await res.text()).not.toContain(secret);
      },
    );

    it("serves index.html for unknown navigation paths so the client router owns them", async () => {
      const app = createApp(webRoot);

      for (const path of ["/pipeline", "/no-such-route", "/editorial/piezas", "/apiculture"]) {
        const res = await app.request(path);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("<h1>Contento</h1>");
      }
    });

    it.each([
      ["GET request for a missing file", "/missing.css", "GET"],
      ["GET request under /api", "/api/unknown", "GET"],
      ["GET request for the /api root", "/api", "GET"],
      ["POST request to an unknown route", "/no-such-route", "POST"],
      ["GET request with a malformed escape", "/%zz", "GET"],
    ])("returns plain 404 text for %s", async (_label, path, method) => {
      const res = await createApp(webRoot).request(path, { method });

      expect(res.status).toBe(404);
      expect(res.headers.get("content-type")).toContain("text/plain");
      expect(await res.text()).toBe("404 Not Found");
    });

    it("returns 404 for a navigation path when the web root is empty", async () => {
      const res = await createApp(emptyWebRoot).request("/pipeline");

      expect(res.status).toBe(404);
    });
  });

  describe("default configuration", () => {
    it("resolves the web root relative to the module, not the working directory", async () => {
      const cwd = vi.spyOn(process, "cwd").mockReturnValue("/nowhere");
      try {
        vi.resetModules();
        const { defaultWebRoot } = await import("./app");

        expect(defaultWebRoot).toBe(fileURLToPath(new URL("../../dist", import.meta.url)));
      } finally {
        cwd.mockRestore();
      }
    });

    it("creates a working app without arguments", async () => {
      const res = await createApp().request("/health");

      expect(res.status).toBe(200);
    });
  });
});
