import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Hono } from "hono";
import { createApp } from "./app";
import { createAuth, mountAuth } from "./auth";
import { createDatabase } from "./database";

type Database = ReturnType<typeof createDatabase>;

const firstUser = { name: "Ada", email: "ada@example.com", password: "password123" };
const secondUser = { name: "Grace", email: "grace@example.com", password: "password456" };

const signup = (app: Hono, body: unknown) =>
  app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const login = (app: Hono, credentials: { email: string; password: string }) =>
  app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(credentials),
  });

const logout = (app: Hono, cookie: string) =>
  app.request("/api/auth/sign-out", { method: "POST", headers: { cookie } });

const me = (app: Hono, cookie?: string) =>
  app.request("/api/me", { headers: cookie ? { cookie } : {} });

const sessionCookie = (response: Response) => response.headers.get("set-cookie") ?? "";

describe("authentication", () => {
  let database: Database;
  let app: Hono;

  beforeEach(async () => {
    database = createDatabase("");
    await database.migrate();
    app = createApp();
    mountAuth(app, createAuth(database));
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await database.close();
  });

  it("rejects a sign-up without the required fields", async () => {
    const response = await signup(app, { email: firstUser.email });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it("returns a session cookie on sign-up and serves the user with it", async () => {
    const response = await signup(app, firstUser);

    expect(response.ok).toBe(true);
    const cookie = sessionCookie(response);
    expect(cookie).toContain("better-auth.session_token");

    const meResponse = await me(app, cookie);
    expect(meResponse.status).toBe(200);
    expect(await meResponse.json()).toEqual({ email: firstUser.email });
  });

  it("signs in with the registered credentials and invalidates the session on sign-out", async () => {
    await signup(app, firstUser);

    const loginResponse = await login(app, {
      email: firstUser.email,
      password: firstUser.password,
    });
    expect(loginResponse.ok).toBe(true);
    const cookie = sessionCookie(loginResponse);
    expect(cookie).toContain("better-auth.session_token");

    await logout(app, cookie);

    expect((await me(app, cookie)).status).toBe(401);
  });

  it("lets two registered users sign in", async () => {
    await signup(app, firstUser);
    await signup(app, secondUser);

    expect((await login(app, { email: firstUser.email, password: firstUser.password })).ok).toBe(true);
    expect((await login(app, { email: secondUser.email, password: secondUser.password })).ok).toBe(
      true,
    );
  });

  it("rejects a sign-up with an email that is already registered", async () => {
    await signup(app, firstUser);

    const response = await signup(app, { ...firstUser, name: "Other Ada" });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it("rejects a sign-in with a wrong password", async () => {
    await signup(app, firstUser);

    const response = await login(app, { email: firstUser.email, password: "wrong-password" });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it("rejects a request to the protected route without a session", async () => {
    const response = await me(app);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
  });

  it("answers auth endpoints with JSON", async () => {
    const response = await signup(app, firstUser);

    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toMatchObject({ user: { email: firstUser.email } });
  });

  it("rejects a malformed JSON body with a 4xx error", async () => {
    const response = await signup(app, "{not json");

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it("rejects a sign-in with a user that does not exist", async () => {
    const response = await login(app, { email: "nobody@example.com", password: "password123" });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it("uses the base URL from the environment", () => {
    vi.stubEnv("BETTER_AUTH_URL", "http://auth.example.test");

    const auth = createAuth(database);

    expect(auth.options.baseURL).toBe("http://auth.example.test");
  });
});
