import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Hono } from "hono";
import { createApp } from "./app";
import { createAuth, deleteWorkspaceApiKeys, mountAuth } from "./auth";
import { createDatabase } from "./database";

type Database = ReturnType<typeof createDatabase>;
type Auth = ReturnType<typeof createAuth>;

const owner = { name: "Ada", email: "ada@example.com", password: "password123" };
const autor = { name: "Grace", email: "grace@example.com", password: "password456" };
const member = { name: "Edsger", email: "edsger@example.com", password: "password789" };
const editor = { name: "Barbara", email: "barbara@example.com", password: "password000" };

const jsonPost = (app: Hono, path: string, body: unknown, cookie?: string) =>
  app.request(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });

const jsonGet = (app: Hono, path: string, cookie?: string) =>
  app.request(path, { headers: cookie ? { cookie } : {} });

const signup = (app: Hono, credentials: typeof owner) =>
  jsonPost(app, "/api/auth/sign-up/email", credentials);

const sessionCookie = (response: Response) => response.headers.get("set-cookie") ?? "";

const must = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) throw new Error("expected a defined value");
  return value;
};

const listWorkspaces = (app: Hono, cookie: string) =>
  jsonGet(app, "/api/auth/organization/list", cookie);

const createWorkspace = (app: Hono, cookie: string, name: string, slug: string) =>
  jsonPost(app, "/api/auth/organization/create", { name, slug }, cookie);

const invite = (app: Hono, cookie: string, organizationId: string, email: string, role: string) =>
  jsonPost(app, "/api/auth/organization/invite-member", { organizationId, email, role }, cookie);

const acceptInvitation = (app: Hono, cookie: string, invitationId: string) =>
  jsonPost(app, "/api/auth/organization/accept-invitation", { invitationId }, cookie);

const createKey = (app: Hono, cookie: string, organizationId: string, name: string) =>
  jsonPost(app, "/api/auth/api-key/create", { organizationId, name }, cookie);

const listKeys = (app: Hono, cookie: string, organizationId: string) =>
  jsonGet(app, `/api/auth/api-key/list?organizationId=${organizationId}`, cookie);

const deleteKey = (app: Hono, cookie: string, keyId: string) =>
  jsonPost(app, "/api/auth/api-key/delete", { keyId }, cookie);

const deleteWorkspace = (app: Hono, cookie: string, organizationId: string) =>
  jsonPost(app, "/api/auth/organization/delete", { organizationId }, cookie);

interface CreatedKey {
  id: string;
  key: string;
  referenceId: string;
  name: string | null;
  rateLimitEnabled: boolean;
}

interface VerifyResult {
  valid: boolean;
  error: { code?: string } | null;
  key: { referenceId: string; permissions: Record<string, string[]> | null } | null;
}

interface ApiKeyApi {
  verifyApiKey: (args: { body: { key: string } }) => Promise<VerifyResult>;
  createApiKey: (args: {
    body: {
      organizationId: string;
      userId: string;
      name?: string;
      permissions?: Record<string, string[]>;
    };
  }) => Promise<CreatedKey>;
}

const apiKeyApi = (authInstance: Auth) => authInstance.api as unknown as ApiKeyApi;

const verifyKey = (authInstance: Auth, key: string): Promise<VerifyResult> =>
  apiKeyApi(authInstance).verifyApiKey({ body: { key } });

const ownerWorkspace = async (app: Hono, credentials: typeof owner) => {
  const response = await signup(app, credentials);
  const cookie = sessionCookie(response);
  const userId = must(((await response.json()) as { user: { id: string } }).user.id);
  const workspaces = (await (await listWorkspaces(app, cookie)).json()) as { id: string }[];
  return { cookie, userId, workspaceId: must(workspaces[0]).id };
};

const joinWorkspace = async (
  app: Hono,
  ownerCookie: string,
  workspaceId: string,
  credentials: typeof owner,
  role: string,
) => {
  const inviteeResponse = await signup(app, credentials);
  const inviteeCookie = sessionCookie(inviteeResponse);
  const invited = await invite(app, ownerCookie, workspaceId, credentials.email, role);
  expect(invited.ok).toBe(true);
  const created = (await invited.json()) as { id: string };
  const accepted = await acceptInvitation(app, inviteeCookie, created.id);
  expect(accepted.ok).toBe(true);
  return inviteeCookie;
};

describe("api keys", () => {
  let database: Database;
  let app: Hono;
  let authInstance: Auth;

  beforeEach(async () => {
    database = createDatabase("");
    await database.migrate();
    app = createApp();
    authInstance = createAuth(database);
    mountAuth(app, authInstance);
  });

  afterEach(async () => {
    await database.close();
  });

  it("rejects creating a key without a session or an organization", async () => {
    const { cookie, workspaceId } = await ownerWorkspace(app, owner);

    const anonymous = await createKey(app, "", workspaceId, "agent");
    expect(anonymous.status).toBeGreaterThanOrEqual(400);

    const missingOrganization = await jsonPost(
      app,
      "/api/auth/api-key/create",
      { name: "agent" },
      cookie,
    );
    expect(missingOrganization.status).toBeGreaterThanOrEqual(400);
  });

  it("verifies a valid key and returns its workspace and permissions", async () => {
    const { cookie, userId, workspaceId } = await ownerWorkspace(app, owner);

    const byClient = await jsonPost(
      app,
      "/api/auth/api-key/create",
      { organizationId: workspaceId, name: "writer-agent", permissions: { content: ["read"] } },
      cookie,
    );
    expect(byClient.status).toBeGreaterThanOrEqual(400);

    const apiKey = await apiKeyApi(authInstance).createApiKey({
      body: {
        organizationId: workspaceId,
        userId,
        name: "writer-agent",
        permissions: { content: ["read"] },
      },
    });
    expect(apiKey.referenceId).toBe(workspaceId);
    expect(apiKey.key.length).toBeGreaterThan(0);
    expect(apiKey.rateLimitEnabled).toBe(false);

    for (let i = 0; i < 12; i += 1) {
      const result = await verifyKey(authInstance, apiKey.key);
      expect(result.valid).toBe(true);
    }
    const result = await verifyKey(authInstance, apiKey.key);
    expect(result.key?.referenceId).toBe(workspaceId);
    expect(result.key?.permissions).toEqual({ content: ["read"] });
  });

  it("lets an admin create keys and lists the keys of the workspace", async () => {
    const { cookie, workspaceId } = await ownerWorkspace(app, owner);
    const adminCookie = await joinWorkspace(app, cookie, workspaceId, member, "admin");

    const byAdmin = await createKey(app, adminCookie, workspaceId, "admin-agent");
    expect(byAdmin.ok).toBe(true);
    const byOwner = await createKey(app, cookie, workspaceId, "owner-agent");
    expect(byOwner.ok).toBe(true);

    const list = (await (await listKeys(app, cookie, workspaceId)).json()) as {
      apiKeys: { name: string | null; referenceId: string }[];
    };
    expect(list.apiKeys.map((k) => k.name).sort()).toEqual(["admin-agent", "owner-agent"]);
    expect(list.apiKeys.every((k) => k.referenceId === workspaceId)).toBe(true);
  });

  it("does not verify an expired or deleted key", async () => {
    const { cookie, workspaceId } = await ownerWorkspace(app, owner);

    const expiring = (await (
      await createKey(app, cookie, workspaceId, "expiring-agent")
    ).json()) as CreatedKey;
    const removed = (await (
      await createKey(app, cookie, workspaceId, "removed-agent")
    ).json()) as CreatedKey;
    await database.execute(
      `UPDATE apikey SET expires_at = '1970-01-01T00:00:00Z' WHERE id = '${expiring.id}'`,
    );
    const deleted = await deleteKey(app, cookie, removed.id);
    expect(deleted.ok).toBe(true);

    const expired = await verifyKey(authInstance, expiring.key);
    expect(expired.valid).toBe(false);
    const gone = await verifyKey(authInstance, removed.key);
    expect(gone.valid).toBe(false);
  });

  it("rejects key creation by members without the apiKey permission", async () => {
    const { cookie, workspaceId } = await ownerWorkspace(app, owner);
    const autorCookie = await joinWorkspace(app, cookie, workspaceId, autor, "autor");
    const memberCookie = await joinWorkspace(app, cookie, workspaceId, member, "member");
    const editorCookie = await joinWorkspace(app, cookie, workspaceId, editor, "editor");

    const byAutor = await createKey(app, autorCookie, workspaceId, "autor-agent");
    expect(byAutor.status).toBeGreaterThanOrEqual(400);
    const byMember = await createKey(app, memberCookie, workspaceId, "member-agent");
    expect(byMember.status).toBeGreaterThanOrEqual(400);
    const byEditor = await createKey(app, editorCookie, workspaceId, "editor-agent");
    expect(byEditor.status).toBeGreaterThanOrEqual(400);

    const list = (await (await listKeys(app, cookie, workspaceId)).json()) as {
      apiKeys: unknown[];
    };
    expect(list.apiKeys).toHaveLength(0);
  });

  it("rejects creating a key for a workspace the user does not belong to", async () => {
    const { workspaceId } = await ownerWorkspace(app, owner);

    const foreign = await createKey(
      app,
      sessionCookie(await signup(app, member)),
      workspaceId,
      "intruder-agent",
    );
    expect(foreign.status).toBeGreaterThanOrEqual(400);
  });

  it("scopes keys to their workspace and keeps verify server-side", async () => {
    const { cookie, workspaceId } = await ownerWorkspace(app, owner);
    const editorial = (await (
      await createWorkspace(app, cookie, "Editorial", "editorial")
    ).json()) as { id: string };

    const created = await createKey(app, cookie, editorial.id, "editorial-agent");
    expect(created.ok).toBe(true);
    const apiKey = (await created.json()) as CreatedKey;

    const personalKeys = (await (await listKeys(app, cookie, workspaceId)).json()) as {
      apiKeys: unknown[];
    };
    expect(personalKeys.apiKeys).toHaveLength(0);
    const editorialKeys = (await (await listKeys(app, cookie, editorial.id)).json()) as {
      apiKeys: unknown[];
    };
    expect(editorialKeys.apiKeys).toHaveLength(1);

    const overHttp = await jsonPost(app, "/api/auth/api-key/verify", { key: apiKey.key });
    expect(overHttp.status).toBeGreaterThanOrEqual(400);

    const result = await verifyKey(authInstance, apiKey.key);
    expect(result.valid).toBe(true);
    expect(result.key?.referenceId).toBe(editorial.id);
  });

  it("invalidates the keys of a workspace that gets deleted", async () => {
    const { cookie } = await ownerWorkspace(app, owner);
    const editorial = (await (
      await createWorkspace(app, cookie, "Editorial", "editorial")
    ).json()) as { id: string };

    const created = await createKey(app, cookie, editorial.id, "editorial-agent");
    expect(created.ok).toBe(true);
    const apiKey = (await created.json()) as CreatedKey;

    const deleted = await deleteWorkspace(app, cookie, editorial.id);
    expect(deleted.ok).toBe(true);

    const result = await verifyKey(authInstance, apiKey.key);
    expect(result.valid).toBe(false);
  });

  it("fails closed when the delete hook runs without its context", async () => {
    await expect(deleteWorkspaceApiKeys(undefined, "any-id")).rejects.toThrow(
      "organization delete hook requires its context",
    );
  });
});
