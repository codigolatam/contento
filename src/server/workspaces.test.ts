import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Hono } from "hono";
import { createApp } from "./app";
import { createAuth, createPersonalWorkspace, mountAuth } from "./auth";
import { createDatabase } from "./database";

type Database = ReturnType<typeof createDatabase>;

const owner = { name: "Ada", email: "ada@example.com", password: "password123" };
const autor = { name: "Grace", email: "grace@example.com", password: "password456" };
const editor = { name: "Edsger", email: "edsger@example.com", password: "password789" };

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

const listMembers = (app: Hono, cookie: string, organizationId: string) =>
  jsonGet(app, `/api/auth/organization/list-members?organizationId=${organizationId}`, cookie);

const getFullWorkspace = (app: Hono, cookie: string, organizationId: string) =>
  jsonGet(app, `/api/auth/organization/get-full-organization?organizationId=${organizationId}`, cookie);

const createWorkspace = (app: Hono, cookie: string, name: string, slug: string) =>
  jsonPost(app, "/api/auth/organization/create", { name, slug }, cookie);

const invite = (app: Hono, cookie: string, organizationId: string, email: string, role: string) =>
  jsonPost(app, "/api/auth/organization/invite-member", { organizationId, email, role }, cookie);

const acceptInvitation = (app: Hono, cookie: string, invitationId: string) =>
  jsonPost(app, "/api/auth/organization/accept-invitation", { invitationId }, cookie);

const deleteWorkspace = (app: Hono, cookie: string, organizationId: string) =>
  jsonPost(app, "/api/auth/organization/delete", { organizationId }, cookie);

const renameWorkspace = (app: Hono, cookie: string, organizationId: string, name: string) =>
  jsonPost(app, "/api/auth/organization/update", { organizationId, data: { name } }, cookie);

const userRows = (database: Database) => database.execute('SELECT id FROM "user"');

describe("workspaces", () => {
  let database: Database;
  let app: Hono;

  beforeEach(async () => {
    database = createDatabase("");
    await database.migrate();
    app = createApp();
    mountAuth(app, createAuth(database));
  });

  afterEach(async () => {
    await database.close();
  });

  it("rejects inviting and accepting without a session", async () => {
    const inviteResponse = await invite(app, "", "any-id", autor.email, "autor");
    const acceptResponse = await acceptInvitation(app, "", "any-id");

    expect(inviteResponse.status).toBeGreaterThanOrEqual(400);
    expect(acceptResponse.status).toBeGreaterThanOrEqual(400);
  });

  it("creates exactly one personal workspace named after the user on sign-up", async () => {
    const response = await signup(app, owner);

    const cookie = sessionCookie(response);
    const workspaces = (await (await listWorkspaces(app, cookie)).json()) as {
      id: string;
      name: string;
      personal?: boolean;
    }[];

    expect(workspaces).toHaveLength(1);
    const personal = must(workspaces[0]);
    expect(personal.name).toBe(owner.name);
    expect(personal.personal).toBe(true);

    const members = (await (await listMembers(app, cookie, personal.id)).json()) as {
      members: { role: string; user: { email: string } }[];
    };
    const users = await userRows(database);
    const self = members.members.find((m) => m.user.email === owner.email);
    expect(self?.role).toBe("owner");
    expect(users.rows).toHaveLength(1);
  });

  it("creates an additional workspace with the creator as owner", async () => {
    const ownerResponse = await signup(app, owner);
    const cookie = sessionCookie(ownerResponse);

    const createResponse = await createWorkspace(app, cookie, "Editorial", "editorial");
    expect(createResponse.ok).toBe(true);

    const workspaces = (await (await listWorkspaces(app, cookie)).json()) as { name: string }[];
    expect(workspaces.map((w) => w.name).sort()).toEqual([owner.name, "Editorial"].sort());
  });

  it("assigns the invited role when the invitation is accepted", async () => {
    const ownerResponse = await signup(app, owner);
    const ownerCookie = sessionCookie(ownerResponse);
    const autorResponse = await signup(app, autor);
    const autorCookie = sessionCookie(autorResponse);
    const workspaces = (await (await listWorkspaces(app, ownerCookie)).json()) as {
      id: string;
    }[];
    const workspaceId = must(workspaces[0]).id;

    const inviteResponse = await invite(app, ownerCookie, workspaceId, autor.email, "autor");
    expect(inviteResponse.ok).toBe(true);
    const created = (await inviteResponse.json()) as { id: string };

    const acceptResponse = await acceptInvitation(app, autorCookie, created.id);
    expect(acceptResponse.ok).toBe(true);

    const members = (await (await listMembers(app, ownerCookie, workspaceId)).json()) as {
      members: { role: string; user: { email: string } }[];
    };
    const invited = members.members.find((m) => m.user.email === autor.email);
    expect(invited?.role).toBe("autor");
  });

  it("assigns the editor role when the invitation is accepted", async () => {
    const ownerResponse = await signup(app, owner);
    const ownerCookie = sessionCookie(ownerResponse);
    const editorResponse = await signup(app, editor);
    const editorCookie = sessionCookie(editorResponse);
    const workspaces = (await (await listWorkspaces(app, ownerCookie)).json()) as {
      id: string;
    }[];
    const workspaceId = must(workspaces[0]).id;

    const inviteResponse = await invite(app, ownerCookie, workspaceId, editor.email, "editor");
    expect(inviteResponse.ok).toBe(true);
    const created = (await inviteResponse.json()) as { id: string };

    const acceptResponse = await acceptInvitation(app, editorCookie, created.id);
    expect(acceptResponse.ok).toBe(true);

    const members = (await (await listMembers(app, ownerCookie, workspaceId)).json()) as {
      members: { role: string; user: { email: string } }[];
    };
    const invited = members.members.find((m) => m.user.email === editor.email);
    expect(invited?.role).toBe("editor");
  });

  it("rejects accepting an invitation after it expires", async () => {
    const ownerResponse = await signup(app, owner);
    const ownerCookie = sessionCookie(ownerResponse);
    const autorResponse = await signup(app, autor);
    const autorCookie = sessionCookie(autorResponse);
    const workspaces = (await (await listWorkspaces(app, ownerCookie)).json()) as {
      id: string;
    }[];

    const inviteResponse = await invite(
      app,
      ownerCookie,
      must(workspaces[0]).id,
      autor.email,
      "editor",
    );
    expect(inviteResponse.ok).toBe(true);
    const created = (await inviteResponse.json()) as { id: string };
    await database.execute(
      `UPDATE invitation SET expires_at = '1970-01-01T00:00:00Z' WHERE id = '${created.id}'`,
    );

    const acceptResponse = await acceptInvitation(app, autorCookie, created.id);
    expect(acceptResponse.status).toBeGreaterThanOrEqual(400);
  });

  it("rejects deleting the personal workspace but allows renaming it", async () => {
    const ownerResponse = await signup(app, owner);
    const cookie = sessionCookie(ownerResponse);
    const workspaces = (await (await listWorkspaces(app, cookie)).json()) as { id: string }[];
    const workspaceId = must(workspaces[0]).id;

    const deleteResponse = await deleteWorkspace(app, cookie, workspaceId);
    expect(deleteResponse.status).toBeGreaterThanOrEqual(400);

    const renameResponse = await renameWorkspace(app, cookie, workspaceId, "Ada Studio");
    expect(renameResponse.ok).toBe(true);
    const after = (await (await listWorkspaces(app, cookie)).json()) as { name: string }[];
    expect(after[0]?.name).toBe("Ada Studio");
  });

  it("allows deleting an additional workspace", async () => {
    const ownerResponse = await signup(app, owner);
    const cookie = sessionCookie(ownerResponse);
    const created = (await (
      await createWorkspace(app, cookie, "Editorial", "editorial")
    ).json()) as { id: string };

    const deleteResponse = await deleteWorkspace(app, cookie, created.id);
    expect(deleteResponse.ok).toBe(true);

    const workspaces = (await (await listWorkspaces(app, cookie)).json()) as unknown[];
    expect(workspaces).toHaveLength(1);
  });

  it("rejects inviting an email that is already a member", async () => {
    const ownerResponse = await signup(app, owner);
    const ownerCookie = sessionCookie(ownerResponse);
    const workspaces = (await (await listWorkspaces(app, ownerCookie)).json()) as {
      id: string;
    }[];

    const response = await invite(app, ownerCookie, must(workspaces[0]).id, owner.email, "autor");
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("rejects invitations sent by a member without admin permissions", async () => {
    const ownerResponse = await signup(app, owner);
    const ownerCookie = sessionCookie(ownerResponse);
    const autorResponse = await signup(app, autor);
    const autorCookie = sessionCookie(autorResponse);
    const workspaces = (await (await listWorkspaces(app, ownerCookie)).json()) as {
      id: string;
    }[];
    const workspaceId = must(workspaces[0]).id;
    const invited = await invite(app, ownerCookie, workspaceId, autor.email, "autor");
    expect(invited.ok).toBe(true);
    const created = (await invited.json()) as { id: string };
    const accepted = await acceptInvitation(app, autorCookie, created.id);
    expect(accepted.ok).toBe(true);

    const response = await invite(app, autorCookie, workspaceId, editor.email, "editor");
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("keeps other workspaces invisible to non-members", async () => {
    const ownerResponse = await signup(app, owner);
    const ownerCookie = sessionCookie(ownerResponse);
    const autorResponse = await signup(app, autor);
    const autorCookie = sessionCookie(autorResponse);
    const ownerWorkspaces = (await (await listWorkspaces(app, ownerCookie)).json()) as {
      id: string;
    }[];
    const foreignId = must(ownerWorkspaces[0]).id;

    const readResponse = await getFullWorkspace(app, autorCookie, foreignId);
    expect(readResponse.status).toBeGreaterThanOrEqual(400);
    const membersResponse = await listMembers(app, autorCookie, foreignId);
    expect(membersResponse.status).toBeGreaterThanOrEqual(400);
    const invitationsResponse = await jsonGet(
      app,
      `/api/auth/organization/list-invitations?organizationId=${foreignId}`,
      autorCookie,
    );
    expect(invitationsResponse.status).toBeGreaterThanOrEqual(400);
    const updateResponse = await renameWorkspace(app, autorCookie, foreignId, "Hijacked");
    expect(updateResponse.status).toBeGreaterThanOrEqual(400);
    const deleteResponse = await deleteWorkspace(app, autorCookie, foreignId);
    expect(deleteResponse.status).toBeGreaterThanOrEqual(400);

    const autorWorkspaces = (await (await listWorkspaces(app, autorCookie)).json()) as {
      id: string;
    }[];
    expect(autorWorkspaces.map((w) => w.id)).not.toContain(foreignId);
  });

  it("rejects accepting an invitation addressed to another email", async () => {
    const ownerResponse = await signup(app, owner);
    const ownerCookie = sessionCookie(ownerResponse);
    const editorResponse = await signup(app, editor);
    const editorCookie = sessionCookie(editorResponse);
    const workspaces = (await (await listWorkspaces(app, ownerCookie)).json()) as {
      id: string;
    }[];

    const inviteResponse = await invite(
      app,
      ownerCookie,
      must(workspaces[0]).id,
      "intruso@example.com",
      "autor",
    );
    expect(inviteResponse.ok).toBe(true);
    const created = (await inviteResponse.json()) as { id: string };

    const response = await acceptInvitation(app, editorCookie, created.id);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("ignores a personal flag sent when creating a workspace", async () => {
    const ownerResponse = await signup(app, owner);
    const cookie = sessionCookie(ownerResponse);

    const createResponse = await jsonPost(
      app,
      "/api/auth/organization/create",
      { name: "Fake personal", slug: "fake-personal", personal: true },
      cookie,
    );
    expect(createResponse.ok).toBe(true);
    const created = (await createResponse.json()) as { id: string; personal?: boolean };

    expect(created.personal).not.toBe(true);
    const deleteResponse = await deleteWorkspace(app, cookie, created.id);
    expect(deleteResponse.ok).toBe(true);
  });

  it("keeps the personal workspace protected when asked to unset the flag", async () => {
    const ownerResponse = await signup(app, owner);
    const cookie = sessionCookie(ownerResponse);
    const workspaces = (await (await listWorkspaces(app, cookie)).json()) as { id: string }[];
    const workspaceId = must(workspaces[0]).id;

    await jsonPost(
      app,
      "/api/auth/organization/update",
      { organizationId: workspaceId, data: { personal: false } },
      cookie,
    );

    const deleteResponse = await deleteWorkspace(app, cookie, workspaceId);
    expect(deleteResponse.status).toBeGreaterThanOrEqual(400);
    const after = (await (await listWorkspaces(app, cookie)).json()) as {
      personal?: boolean;
    }[];
    expect(after[0]?.personal).toBe(true);
  });
});

describe("createPersonalWorkspace", () => {
  let database: Database;
  let app: Hono;
  let authInstance: ReturnType<typeof createAuth>;

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

  it("does nothing for a user that does not exist", async () => {
    const { adapter } = await authInstance.$context;

    await createPersonalWorkspace(adapter, "nonexistent-user");

    const workspaces = await adapter.findMany({ model: "organization" });
    expect(workspaces).toHaveLength(0);
  });

  it("does not create a second personal workspace for the same user", async () => {
    const signupResponse = await signup(app, owner);
    const { adapter } = await authInstance.$context;
    const user = (await signupResponse.json()) as { user: { id: string } };

    await createPersonalWorkspace(adapter, user.user.id);

    const workspaces = await adapter.findMany({ model: "organization" });
    expect(workspaces).toHaveLength(1);
  });

  it("creates the personal workspace for a user that has none", async () => {
    const { adapter } = await authInstance.$context;
    await adapter.create({
      model: "user",
      data: { name: "Solo", email: "solo@example.com", emailVerified: false },
    });
    const created = await adapter.findOne<{ id: string }>({
      model: "user",
      where: [{ field: "email", value: "solo@example.com" }],
    });

    await createPersonalWorkspace(adapter, must(created).id);

    const workspaces = await adapter.findMany({ model: "organization" });
    expect(workspaces).toHaveLength(1);
  });

  it("creates the personal workspace when the user only has other workspaces", async () => {
    const { adapter } = await authInstance.$context;
    await adapter.create({
      model: "user",
      data: { name: "Solo", email: "solo@example.com", emailVerified: false },
    });
    const created = await adapter.findOne<{ id: string }>({
      model: "user",
      where: [{ field: "email", value: "solo@example.com" }],
    });
    const shared = await adapter.create<
      { name: string; slug: string; createdAt: Date },
      { id: string }
    >({
      model: "organization",
      data: { name: "Shared", slug: "shared", createdAt: new Date() },
    });
    await adapter.create({
      model: "member",
      data: {
        organizationId: shared.id,
        userId: must(created).id,
        role: "autor",
        createdAt: new Date(),
      },
    });

    await createPersonalWorkspace(adapter, must(created).id);

    const workspaces = await adapter.findMany<{ personal?: boolean }>({
      model: "organization",
    });
    expect(workspaces).toHaveLength(2);
    expect(workspaces.filter((w) => w.personal === true)).toHaveLength(1);
  });
});

describe("personal workspace rollback", () => {
  it("rejects the sign-up and leaves no user when the workspace creation fails", async () => {
    const database = createDatabase("");
    await database.migrate();
    const app = createApp();
    mountAuth(
      app,
      createAuth(database, {
        createPersonalWorkspace: () => Promise.reject(new Error("workspace creation failed")),
      }),
    );
    try {
      const response = await signup(app, owner);

      expect(response.status).toBeGreaterThanOrEqual(400);
      const users = await userRows(database);
      expect(users.rows).toHaveLength(0);
    } finally {
      await database.close();
    }
  });
});
