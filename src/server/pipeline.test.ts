import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Hono } from "hono";
import { createApp } from "./app";
import { createAuth, mountAuth } from "./auth";
import { createDatabase } from "./database";
import { listEvents } from "./events";
import { mountPipeline } from "./pipeline";
import { createDocument } from "./pieces";

type Database = ReturnType<typeof createDatabase>;
type Auth = ReturnType<typeof createAuth>;

const owner = { name: "Ada", email: "ada@example.com", password: "password123" };
const other = { name: "Grace", email: "grace@example.com", password: "password456" };

interface Credentials {
  name: string;
  email: string;
  password: string;
}

interface Session {
  cookie: string;
  userId: string;
  workspaceId: string;
}

interface ApiKey {
  id: string;
  key: string;
  referenceId: string;
}

interface ApiKeyApi {
  verifyApiKey: (args: { body: { key: string } }) => Promise<{
    valid: boolean;
    key: { id: string; referenceId: string } | null;
  }>;
  createApiKey: (args: {
    body: { organizationId: string; userId: string; name?: string };
  }) => Promise<ApiKey>;
}

const apiKeyApi = (authInstance: Auth) => authInstance.api as unknown as ApiKeyApi;

const must = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) throw new Error("expected a defined value");
  return value;
};

const request = (
  app: Hono,
  method: string,
  path: string,
  options: { body?: unknown; cookie?: string; apiKey?: string; raw?: string } = {},
) =>
  app.request(path, {
    method,
    headers: {
      ...(options.body !== undefined || options.raw !== undefined
        ? { "content-type": "application/json" }
        : {}),
      ...(options.cookie ? { cookie: options.cookie } : {}),
      ...(options.apiKey ? { "x-api-key": options.apiKey } : {}),
    },
    body:
      options.raw ??
      (options.body !== undefined ? JSON.stringify(options.body) : undefined),
  });

const post = (app: Hono, path: string, body?: unknown, auth: { cookie?: string; apiKey?: string } = {}) =>
  request(app, "POST", path, { body, ...auth });

const get = (app: Hono, path: string, auth: { cookie?: string; apiKey?: string } = {}) =>
  request(app, "GET", path, auth);

const patch = (app: Hono, path: string, body: unknown, auth: { cookie?: string; apiKey?: string } = {}) =>
  request(app, "PATCH", path, { body, ...auth });

const del = (app: Hono, path: string, auth: { cookie?: string; apiKey?: string } = {}) =>
  request(app, "DELETE", path, auth);

const signup = async (app: Hono, credentials: Credentials): Promise<Session> => {
  const response = await post(app, "/api/auth/sign-up/email", credentials);
  const cookie = response.headers.get("set-cookie") ?? "";
  const { user } = (await response.json()) as { user: { id: string } };
  const workspaces = (await (
    await get(app, "/api/auth/organization/list", { cookie })
  ).json()) as { id: string }[];
  return { cookie, userId: user.id, workspaceId: must(workspaces[0]).id };
};

const createWorkspace = async (app: Hono, cookie: string, name: string, slug: string) => {
  const response = await post(app, "/api/auth/organization/create", { name, slug }, { cookie });
  return ((await response.json()) as { id: string }).id;
};

const createAgentKey = (authInstance: Auth, session: Session, name = "agent") =>
  apiKeyApi(authInstance).createApiKey({
    body: { organizationId: session.workspaceId, userId: session.userId, name },
  });

const pieceEvents = (database: Database, pieceId: string) =>
  listEvents(database.db, { entityType: "piece", entityId: pieceId });

const unapplyLatestMigration = (database: Database) =>
  database.execute(
    `DELETE FROM drizzle.__drizzle_migrations WHERE id = (SELECT MAX(id) FROM drizzle.__drizzle_migrations)`,
  );

const pointerOf = async (database: Database, userId: string) => {
  const result = (await database.execute(
    `SELECT personal_workspace_id AS pointer FROM "user" WHERE id = '${userId}'`,
  )) as { rows: { pointer: string | null }[] };
  return must(result.rows[0]).pointer;
};

const completePiece = async (
  app: Hono,
  auth: { cookie?: string; apiKey?: string },
  fields: Record<string, string> = {},
) => {
  const created = await post(app, "/api/pieces", fields, auth);
  expect(created.status).toBe(201);
  const piece = (await created.json()) as { id: string };
  const patched = await patch(
    app,
    `/api/pieces/${piece.id}`,
    { topic: "topic", readerQuestion: "question", angle: "angle", ...fields },
    auth,
  );
  expect(patched.status).toBe(200);
  const doc = await post(app, "/api/documents", { title: "source" }, auth);
  const document = (await doc.json()) as { id: string };
  expect(doc.status).toBe(201);
  const linked = await post(app, `/api/pieces/${piece.id}/links`, { documentId: document.id }, auth);
  expect(linked.status).toBe(201);
  return piece.id;
};

describe("pipeline api", () => {
  let database: Database;
  let app: Hono;
  let authInstance: Auth;

  beforeEach(async () => {
    database = createDatabase("");
    await database.migrate();
    app = createApp();
    authInstance = createAuth(database);
    mountAuth(app, authInstance);
    mountPipeline(app, { db: database.db, auth: authInstance });
  });

  afterEach(async () => {
    await database.close();
  });

  describe("actor resolution", () => {
    it("rejects requests without session or api key with 401", async () => {
      const res = await get(app, "/api/pieces");

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    });

    it("rejects an invalid api key with 401", async () => {
      const res = await get(app, "/api/pieces", { apiKey: "not-a-real-key" });

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: "unauthorized" });
    });

    it("resolves the personal workspace for a session without active organization", async () => {
      const session = await signup(app, owner);

      const res = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await res.json()) as { workspaceId: string };

      expect(res.status).toBe(201);
      expect(piece.workspaceId).toBe(session.workspaceId);
    });

    it("uses the active organization when the session belongs to it", async () => {
      const session = await signup(app, owner);
      const editorial = await createWorkspace(app, session.cookie, "Editorial", "editorial");
      await post(
        app,
        "/api/auth/organization/set-active",
        { organizationId: editorial },
        { cookie: session.cookie },
      );

      const res = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await res.json()) as { workspaceId: string };

      expect(piece.workspaceId).toBe(editorial);
    });

    it("falls back to the personal workspace when the active organization is not a membership", async () => {
      const session = await signup(app, owner);
      await database.execute(
        `UPDATE session SET active_organization_id = 'foreign-org' WHERE user_id = '${session.userId}'`,
      );

      const res = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await res.json()) as { workspaceId: string };

      expect(piece.workspaceId).toBe(session.workspaceId);
    });

    it("falls back to the user's own personal workspace, not a foreign personal membership", async () => {
      const ada = await signup(app, owner);
      const grace = await signup(app, other);

      const personalOrgId = async (userId: string) => {
        const result = (await database.execute(
          `SELECT id FROM organization WHERE slug = 'personal-${userId}'`,
        )) as { rows: { id: string }[] };
        return must(result.rows[0]).id;
      };
      const adaPersonal = await personalOrgId(ada.userId);
      const gracePersonal = await personalOrgId(grace.userId);

      const inviteRes = await post(
        app,
        "/api/auth/organization/invite-member",
        { organizationId: adaPersonal, email: other.email, role: "member" },
        { cookie: ada.cookie },
      );
      expect(inviteRes.status).toBe(200);
      const invitation = (await inviteRes.json()) as { id: string };
      const acceptRes = await post(
        app,
        "/api/auth/organization/accept-invitation",
        { invitationId: invitation.id },
        { cookie: grace.cookie },
      );
      expect(acceptRes.status).toBe(200);
      const foreignMembership = (await database.execute(
        `SELECT id FROM member WHERE user_id = '${grace.userId}' AND organization_id = '${adaPersonal}'`,
      )) as { rows: { id: string }[] };
      expect(foreignMembership.rows).toHaveLength(1);
      await post(
        app,
        "/api/auth/organization/set-active",
        { organizationId: null },
        { cookie: grace.cookie },
      );

      await database.execute(
        `DELETE FROM member WHERE user_id = '${grace.userId}' AND organization_id = '${gracePersonal}'`,
      );
      await database.execute(
        `INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES ('grace-personal', '${gracePersonal}', '${grace.userId}', 'owner', now())`,
      );

      const res = await post(app, "/api/pieces", {}, { cookie: grace.cookie });
      const piece = (await res.json()) as { workspaceId: string };

      expect(piece.workspaceId).toBe(gracePersonal);
    });

    it("keeps resolving the personal workspace after its slug is renamed", async () => {
      const session = await signup(app, owner);
      const updated = await post(
        app,
        "/api/auth/organization/update",
        { organizationId: session.workspaceId, data: { slug: "renamed-studio" } },
        { cookie: session.cookie },
      );
      expect(updated.status).toBe(200);

      const res = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await res.json()) as { workspaceId: string };

      expect(res.status).toBe(201);
      expect(piece.workspaceId).toBe(session.workspaceId);
    });

    it("restores pipeline access for pre-migration accounts via the backfill", async () => {
      const session = await signup(app, owner);
      await database.execute(
        `UPDATE "user" SET personal_workspace_id = NULL WHERE id = '${session.userId}'`,
      );

      await unapplyLatestMigration(database);
      await database.migrate();

      expect(await pointerOf(database, session.userId)).toBe(session.workspaceId);
      const res = await get(app, "/api/pieces", { cookie: session.cookie });
      expect(res.status).toBe(200);
    });

    it("backfills the pointer when the personal workspace slug was renamed", async () => {
      const session = await signup(app, owner);
      const renamed = await post(
        app,
        "/api/auth/organization/update",
        { organizationId: session.workspaceId, data: { slug: "renamed-studio" } },
        { cookie: session.cookie },
      );
      expect(renamed.status).toBe(200);
      await database.execute(
        `UPDATE "user" SET personal_workspace_id = NULL WHERE id = '${session.userId}'`,
      );

      await unapplyLatestMigration(database);
      await database.migrate();

      expect(await pointerOf(database, session.userId)).toBe(session.workspaceId);
      const res = await get(app, "/api/pieces", { cookie: session.cookie });
      expect(res.status).toBe(200);
    });

    it("leaves the pointer unset when personal ownership is ambiguous", async () => {
      const session = await signup(app, owner);
      const renamed = await post(
        app,
        "/api/auth/organization/update",
        { organizationId: session.workspaceId, data: { slug: "renamed-studio" } },
        { cookie: session.cookie },
      );
      expect(renamed.status).toBe(200);
      await database.execute(
        `INSERT INTO organization (id, name, slug, personal, created_at) VALUES ('ws-other', 'Ada', 'other', true, now())`,
      );
      await database.execute(
        `INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES ('m-other', 'ws-other', '${session.userId}', 'owner', now())`,
      );
      await database.execute(
        `UPDATE "user" SET personal_workspace_id = NULL WHERE id = '${session.userId}'`,
      );

      await unapplyLatestMigration(database);
      await database.migrate();

      expect(await pointerOf(database, session.userId)).toBeNull();
      const res = await get(app, "/api/pieces", { cookie: session.cookie });
      expect(res.status).toBe(403);
    });

    it("rejects a session whose account has no personal workspace with 403", async () => {
      const session = await signup(app, owner);
      await database.execute(
        `UPDATE "user" SET personal_workspace_id = NULL WHERE id = '${session.userId}'`,
      );

      const res = await get(app, "/api/pieces", { cookie: session.cookie });

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "forbidden" });
    });

    it("resolves the workspace of a valid api key", async () => {
      const session = await signup(app, owner);
      const key = await createAgentKey(authInstance, session);

      const res = await post(app, "/api/pieces", {}, { apiKey: key.key });
      const piece = (await res.json()) as { workspaceId: string };

      expect(res.status).toBe(201);
      expect(piece.workspaceId).toBe(session.workspaceId);
    });

    it("prefers the session over an api key when both are present", async () => {
      const session = await signup(app, owner);
      const editorial = await createWorkspace(app, session.cookie, "Editorial", "editorial");
      const otherSession = await signup(app, other);
      const foreignKey = await createAgentKey(authInstance, otherSession, "foreign-agent");

      const res = await post(
        app,
        "/api/pieces",
        {},
        { cookie: session.cookie, apiKey: foreignKey.key },
      );
      const piece = (await res.json()) as { workspaceId: string };

      expect(piece.workspaceId).toBe(editorial);
    });
  });

  describe("pieces", () => {
    it("creates a piece born in proposal and records the event with the actor", async () => {
      const session = await signup(app, owner);

      const res = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await res.json()) as {
        id: string;
        status: string;
        topic: string | null;
        fieldsFrozen: boolean;
      };

      expect(res.status).toBe(201);
      expect(piece.status).toBe("proposal");
      expect(piece.topic).toBeNull();
      expect(piece.fieldsFrozen).toBe(false);

      const events = await pieceEvents(database, piece.id);
      expect(events).toHaveLength(1);
      expect(must(events[0]).type).toBe("piece.created");
      expect(must(events[0]).actor).toBe(`user:${session.userId}`);
    });

    it("creates a piece with initial fields and records the api key actor", async () => {
      const session = await signup(app, owner);
      const key = await createAgentKey(authInstance, session);

      const res = await post(
        app,
        "/api/pieces",
        { topic: "Initial topic" },
        { apiKey: key.key },
      );
      const piece = (await res.json()) as { id: string; topic: string };

      expect(piece.topic).toBe("Initial topic");
      const events = await pieceEvents(database, piece.id);
      expect(must(events[0]).actor).toBe(`api-key:${key.id}`);
    });

    it("lists an empty workspace with no pieces", async () => {
      const session = await signup(app, owner);

      const res = await get(app, "/api/pieces", { cookie: session.cookie });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    it("edits fields before freezing and grows the maturity", async () => {
      const session = await signup(app, owner);
      const created = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await created.json()) as { id: string };

      const empty = (await (await get(app, "/api/pieces", { cookie: session.cookie })).json()) as {
        maturity: number;
      }[];
      expect(must(empty[0]).maturity).toBe(0);

      const edited = await patch(
        app,
        `/api/pieces/${piece.id}`,
        { topic: "A topic", readerQuestion: "A question" },
        { cookie: session.cookie },
      );
      expect(edited.status).toBe(200);

      const listed = (await (await get(app, "/api/pieces", { cookie: session.cookie })).json()) as {
        maturity: number;
      }[];
      expect(must(listed[0]).maturity).toBe(2);
    });

    it("treats blank fields as missing for maturity", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      await patch(app, `/api/pieces/${pieceId}`, { topic: "   " }, { cookie: session.cookie });

      const detail = (await (
        await get(app, `/api/pieces/${pieceId}`, { cookie: session.cookie })
      ).json()) as { piece: { maturity: number; missing: string[] } };

      expect(detail.piece.maturity).toBe(3);
      expect(detail.piece.missing).toEqual(["topic"]);
    });

    it("reports every requirement as missing on an empty piece", async () => {
      const session = await signup(app, owner);
      const created = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await created.json()) as { id: string };

      const detail = (await (
        await get(app, `/api/pieces/${piece.id}`, { cookie: session.cookie })
      ).json()) as { piece: { missing: string[]; maturity: number } };

      expect(detail.piece.missing).toEqual(["topic", "readerQuestion", "angle", "support"]);
      expect(detail.piece.maturity).toBe(0);
    });

    it("returns the detail with linked documents, maturity and missing requirements", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });

      const res = await get(app, `/api/pieces/${pieceId}`, { cookie: session.cookie });
      const detail = (await res.json()) as {
        piece: { maturity: number; missing: string[]; status: string };
        documents: { type: string; title: string }[];
      };

      expect(detail.piece.maturity).toBe(4);
      expect(detail.piece.missing).toEqual([]);
      expect(detail.documents).toHaveLength(1);
      expect(must(detail.documents[0]).type).toBe("resource");
    });

    it("rejects editing frozen fields after approval", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      await post(app, `/api/pieces/${pieceId}/approve`, {}, { cookie: session.cookie });

      const res = await patch(
        app,
        `/api/pieces/${pieceId}`,
        { topic: "new angle" },
        { cookie: session.cookie },
      );

      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({ error: "fields_frozen" });
    });

    it("returns the piece unchanged when the patch carries no fields", async () => {
      const session = await signup(app, owner);
      const created = await post(app, "/api/pieces", { topic: "kept" }, { cookie: session.cookie });
      const piece = (await created.json()) as { id: string; topic: string };

      const res = await patch(app, `/api/pieces/${piece.id}`, {}, { cookie: session.cookie });
      const updated = (await res.json()) as { topic: string };

      expect(res.status).toBe(200);
      expect(updated.topic).toBe("kept");
    });

    it("rejects non-string field values with 400", async () => {
      const session = await signup(app, owner);
      const created = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await created.json()) as { id: string };

      const res = await patch(
        app,
        `/api/pieces/${piece.id}`,
        { topic: 42 },
        { cookie: session.cookie },
      );

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "invalid_field", field: "topic" });
    });

    it("rejects malformed json bodies with 400", async () => {
      const session = await signup(app, owner);

      for (const raw of ["not-json", "null", "[1,2]", '"text"']) {
        const res = await request(app, "POST", "/api/pieces", {
          raw,
          cookie: session.cookie,
        });
        expect(res.status).toBe(400);
      }
    });

    it("returns 404 for pieces of another workspace", async () => {
      const session = await signup(app, owner);
      const foreign = await signup(app, other);
      const created = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const piece = (await created.json()) as { id: string };

      const list = await get(app, "/api/pieces", { cookie: foreign.cookie });
      expect(await list.json()).toEqual([]);

      const detail = await get(app, `/api/pieces/${piece.id}`, { cookie: foreign.cookie });
      expect(detail.status).toBe(404);

      const patched = await patch(
        app,
        `/api/pieces/${piece.id}`,
        { topic: "intrusion" },
        { cookie: foreign.cookie },
      );
      expect(patched.status).toBe(404);
    });
  });

  describe("approve gate", () => {
    it("rejects approval with missing requirements and enumerates them", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      await patch(app, `/api/pieces/${pieceId}`, { angle: "  " }, { cookie: session.cookie });

      const res = await post(app, `/api/pieces/${pieceId}/approve`, {}, { cookie: session.cookie });
      const body = (await res.json()) as { error: string; missing: string[] };

      expect(res.status).toBe(409);
      expect(body.error).toBe("requirements_missing");
      expect(body.missing).toEqual(["angle"]);
    });

    it("approves a complete piece, freezes the fields and records the event", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });

      const res = await post(app, `/api/pieces/${pieceId}/approve`, {}, { cookie: session.cookie });
      const piece = (await res.json()) as {
        status: string;
        fieldsFrozen: boolean;
        topic: string;
      };

      expect(res.status).toBe(200);
      expect(piece.status).toBe("idea_approved");
      expect(piece.fieldsFrozen).toBe(true);
      expect(piece.topic).toBe("topic");

      const events = await pieceEvents(database, pieceId);
      const approved = events.find((event) => event.type === "piece.approved");
      expect(approved?.actor).toBe(`user:${session.userId}`);
      expect(approved?.data).toMatchObject({ topic: "topic", angle: "angle" });
    });

    it("rejects approval from an api key with 403", async () => {
      const session = await signup(app, owner);
      const key = await createAgentKey(authInstance, session);
      const pieceId = await completePiece(app, { apiKey: key.key });

      const res = await post(app, `/api/pieces/${pieceId}/approve`, {}, { apiKey: key.key });

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "forbidden" });
    });

    it("rejects re-approving an approved piece with 409", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      await post(app, `/api/pieces/${pieceId}/approve`, {}, { cookie: session.cookie });

      const res = await post(app, `/api/pieces/${pieceId}/approve`, {}, { cookie: session.cookie });

      expect(res.status).toBe(409);
      expect(await res.json()).toEqual({
        error: "invalid_transition",
        from: "idea_approved",
      });
    });

    it("returns 404 approving a piece of another workspace", async () => {
      const session = await signup(app, owner);
      const foreign = await signup(app, other);
      const pieceId = await completePiece(app, { cookie: session.cookie });

      const res = await post(app, `/api/pieces/${pieceId}/approve`, {}, { cookie: foreign.cookie });

      expect(res.status).toBe(404);
    });
  });

  describe("documents and links", () => {
    it("creates a loose resource and lists it with its pieces", async () => {
      const session = await signup(app, owner);

      const created = await post(
        app,
        "/api/documents",
        { title: "Source", body: "notes" },
        { cookie: session.cookie },
      );
      const doc = (await created.json()) as { id: string; type: string; pieceIds?: string[] };

      expect(created.status).toBe(201);
      expect(doc.type).toBe("resource");

      const list = (await (
        await get(app, "/api/documents", { cookie: session.cookie })
      ).json()) as { id: string; pieceIds: string[] }[];
      expect(list).toHaveLength(1);
      expect(must(list[0]).pieceIds).toEqual([]);
    });

    it("creates a resource already linked to pieces", async () => {
      const session = await signup(app, owner);
      const first = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const secondPiece = await post(app, "/api/pieces", {}, { cookie: session.cookie });
      const firstId = ((await first.json()) as { id: string }).id;
      const secondId = ((await secondPiece.json()) as { id: string }).id;

      const res = await post(
        app,
        "/api/documents",
        { title: "Shared source", pieceIds: [firstId, secondId] },
        { cookie: session.cookie },
      );
      expect(res.status).toBe(201);

      const detail = (await (
        await get(app, `/api/pieces/${firstId}`, { cookie: session.cookie })
      ).json()) as { documents: { title: string }[] };
      expect(detail.documents).toHaveLength(1);

      const listed = (await (
        await get(app, "/api/documents", { cookie: session.cookie })
      ).json()) as { pieceIds: string[] }[];
      expect(must(listed[0]).pieceIds.sort()).toEqual([firstId, secondId].sort());
    });

    it("rolls back the document when a piece id does not exist", async () => {
      const session = await signup(app, owner);

      const res = await post(
        app,
        "/api/documents",
        { title: "Orphan", pieceIds: ["missing-piece"] },
        { cookie: session.cookie },
      );

      expect(res.status).toBe(404);
      const list = await get(app, "/api/documents", { cookie: session.cookie });
      expect(await list.json()).toEqual([]);
    });

    it("links an existing resource to a piece", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      const doc = await post(app, "/api/documents", { title: "extra" }, { cookie: session.cookie });
      const documentId = ((await doc.json()) as { id: string }).id;

      const res = await post(
        app,
        `/api/pieces/${pieceId}/links`,
        { documentId },
        { cookie: session.cookie },
      );

      expect(res.status).toBe(201);
      const detail = (await (
        await get(app, `/api/pieces/${pieceId}`, { cookie: session.cookie })
      ).json()) as { documents: unknown[] };
      expect(detail.documents).toHaveLength(2);

      const listed = (await (
        await get(app, "/api/pieces", { cookie: session.cookie })
      ).json()) as { maturity: number }[];
      expect(must(listed[0]).maturity).toBe(4);
    });

    it("rejects invalid link payloads with 400", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });

      for (const body of [{}, { documentId: 7 }, { documentId: "" }]) {
        const res = await post(app, `/api/pieces/${pieceId}/links`, body, {
          cookie: session.cookie,
        });
        expect(res.status).toBe(400);
      }
    });

    it("returns 404 linking pieces or documents of another workspace", async () => {
      const session = await signup(app, owner);
      const foreign = await signup(app, other);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      const foreignDoc = await post(app, "/api/documents", { title: "foreign" }, {
        cookie: foreign.cookie,
      });
      const foreignDocId = ((await foreignDoc.json()) as { id: string }).id;
      const ownDoc = await post(app, "/api/documents", { title: "own" }, {
        cookie: session.cookie,
      });
      const ownDocId = ((await ownDoc.json()) as { id: string }).id;

      const foreignPiece = await post(app, `/api/pieces/${pieceId}/links`, { documentId: ownDocId }, {
        cookie: foreign.cookie,
      });
      expect(foreignPiece.status).toBe(404);

      const foreignDocument = await post(app, `/api/pieces/${pieceId}/links`, { documentId: foreignDocId }, {
        cookie: session.cookie,
      });
      expect(foreignDocument.status).toBe(404);
    });

    it("rejects linking a document that is not a resource", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      const draft = await createDocument(database.db, {
        workspaceId: session.workspaceId,
        type: "draft",
        title: "draft",
      });

      const res = await post(
        app,
        `/api/pieces/${pieceId}/links`,
        { documentId: draft.id },
        { cookie: session.cookie },
      );

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "only_resources_linkable" });
    });

    it("unlinks a resource from a proposal piece with an api key", async () => {
      const session = await signup(app, owner);
      const key = await createAgentKey(authInstance, session);
      const pieceId = await completePiece(app, { apiKey: key.key });
      const detail = (await (
        await get(app, `/api/pieces/${pieceId}`, { apiKey: key.key })
      ).json()) as { documents: { id: string }[] };
      const documentId = must(detail.documents[0]).id;

      const res = await request(app, "DELETE", `/api/pieces/${pieceId}/links/${documentId}`, {
        apiKey: key.key,
      });

      expect(res.status).toBe(204);
      const after = (await (
        await get(app, `/api/pieces/${pieceId}`, { apiKey: key.key })
      ).json()) as { piece: { maturity: number } };
      expect(after.piece.maturity).toBe(3);
    });

    it("forbids unlinking support from an approved piece with an api key but allows session", async () => {
      const session = await signup(app, owner);
      const key = await createAgentKey(authInstance, session);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      const detail = (await (
        await get(app, `/api/pieces/${pieceId}`, { cookie: session.cookie })
      ).json()) as { documents: { id: string }[] };
      const documentId = must(detail.documents[0]).id;
      await post(app, `/api/pieces/${pieceId}/approve`, {}, { cookie: session.cookie });

      const byKey = await request(app, "DELETE", `/api/pieces/${pieceId}/links/${documentId}`, {
        apiKey: key.key,
      });
      expect(byKey.status).toBe(403);

      const bySession = await request(app, "DELETE", `/api/pieces/${pieceId}/links/${documentId}`, {
        cookie: session.cookie,
      });
      expect(bySession.status).toBe(204);
    });

    it("returns 404 unlinking from a piece of another workspace and 204 for missing links", async () => {
      const session = await signup(app, owner);
      const foreign = await signup(app, other);
      const pieceId = await completePiece(app, { cookie: session.cookie });

      const foreignAttempt = await request(
        app,
        "DELETE",
        `/api/pieces/${pieceId}/links/whatever`,
        { cookie: foreign.cookie },
      );
      expect(foreignAttempt.status).toBe(404);

      const missing = await request(app, "DELETE", `/api/pieces/${pieceId}/links/whatever`, {
        cookie: session.cookie,
      });
      expect(missing.status).toBe(204);
    });

    it("deletes a document and removes its links", async () => {
      const session = await signup(app, owner);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      const detail = (await (
        await get(app, `/api/pieces/${pieceId}`, { cookie: session.cookie })
      ).json()) as { documents: { id: string }[] };
      const documentId = must(detail.documents[0]).id;

      const res = await del(app, `/api/documents/${documentId}`, { cookie: session.cookie });
      expect(res.status).toBe(204);

      const after = (await (
        await get(app, `/api/pieces/${pieceId}`, { cookie: session.cookie })
      ).json()) as { documents: unknown[] };
      expect(after.documents).toEqual([]);
    });

    it("forbids deleting support of an approved piece with an api key but allows session", async () => {
      const session = await signup(app, owner);
      const key = await createAgentKey(authInstance, session);
      const pieceId = await completePiece(app, { cookie: session.cookie });
      const detail = (await (
        await get(app, `/api/pieces/${pieceId}`, { cookie: session.cookie })
      ).json()) as { documents: { id: string }[] };
      const documentId = must(detail.documents[0]).id;
      await post(app, `/api/pieces/${pieceId}/approve`, {}, { cookie: session.cookie });

      const byKey = await del(app, `/api/documents/${documentId}`, { apiKey: key.key });
      expect(byKey.status).toBe(403);

      const bySession = await del(app, `/api/documents/${documentId}`, { cookie: session.cookie });
      expect(bySession.status).toBe(204);
    });

    it("lets an api key delete a resource that only supports proposals", async () => {
      const session = await signup(app, owner);
      const key = await createAgentKey(authInstance, session);
      const pieceId = await completePiece(app, { apiKey: key.key });
      const detail = (await (
        await get(app, `/api/pieces/${pieceId}`, { apiKey: key.key })
      ).json()) as { documents: { id: string }[] };
      const documentId = must(detail.documents[0]).id;

      const res = await del(app, `/api/documents/${documentId}`, { apiKey: key.key });

      expect(res.status).toBe(204);
      const after = (await (
        await get(app, `/api/pieces/${pieceId}`, { apiKey: key.key })
      ).json()) as { documents: unknown[] };
      expect(after.documents).toEqual([]);
    });

    it("returns 404 deleting a document of another workspace or a missing one", async () => {
      const session = await signup(app, owner);
      const foreign = await signup(app, other);
      const doc = await post(app, "/api/documents", { title: "mine" }, { cookie: session.cookie });
      const documentId = ((await doc.json()) as { id: string }).id;

      const foreignAttempt = await del(app, `/api/documents/${documentId}`, {
        cookie: foreign.cookie,
      });
      expect(foreignAttempt.status).toBe(404);

      const missing = await del(app, "/api/documents/nope", { cookie: session.cookie });
      expect(missing.status).toBe(404);
    });
  });

  describe("document validation", () => {
    it("rejects invalid document payloads with 400", async () => {
      const session = await signup(app, owner);

      const cases: Record<string, unknown>[] = [
        { title: "x", type: "draft" },
        { title: "x", type: 7 },
        { type: "resource" },
        { title: "" },
        { title: "   " },
        { title: 9 },
        { title: "x", body: 5 },
        { title: "x", pieceIds: "nope" },
        { title: "x", pieceIds: [1] },
      ];
      for (const body of cases) {
        const res = await post(app, "/api/documents", body, { cookie: session.cookie });
        expect(res.status).toBe(400);
      }
    });
  });

  describe("failure handling", () => {
    it("returns 500 when an unexpected error escapes a handler", async () => {
      const session = await signup(app, owner);
      const key = await createAgentKey(authInstance, session);

      const unmigrated = createDatabase("");
      const brokenApp = createApp();
      mountPipeline(brokenApp, { db: unmigrated.db, auth: authInstance });

      const res = await get(brokenApp, "/api/pieces", { apiKey: key.key });
      expect(res.status).toBe(500);

      await unmigrated.close();
    });
  });
});
