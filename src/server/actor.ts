import { and, eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import type { createAuth } from "./auth";
import type { createDatabase } from "./database";
import { member, organization } from "./schema";

type Database = ReturnType<typeof createDatabase>;
type Db = Database["db"];
type Auth = ReturnType<typeof createAuth>;

export interface Actor {
  kind: "session" | "api-key";
  id: string;
  workspaceId: string;
}

export const actorLabel = (actor: Actor) =>
  `${actor.kind === "session" ? "user" : "api-key"}:${actor.id}`;

interface SessionPayload {
  session: { activeOrganizationId: string | null };
  user: { id: string };
}

interface ApiKeyPayload {
  valid: boolean;
  key: { id: string; referenceId: string } | null;
}

interface ApiKeyApi {
  verifyApiKey: (args: { body: { key: string } }) => Promise<ApiKeyPayload>;
}

type Resolution =
  | { ok: true; actor: Actor }
  | { ok: false; status: 401 | 403; error: string };

const UNAUTHORIZED: Resolution = { ok: false, status: 401, error: "unauthorized" };

const sessionActor = async (auth: Auth, db: Db, headers: Headers): Promise<Resolution | null> => {
  const result = (await auth.api.getSession({ headers })) as SessionPayload | null;
  if (!result) return null;
  const { user } = result;
  const activeOrganizationId = result.session.activeOrganizationId;
  if (activeOrganizationId) {
    const [membership] = await db
      .select({ id: member.id })
      .from(member)
      .where(and(eq(member.userId, user.id), eq(member.organizationId, activeOrganizationId)));
    if (membership) {
      return { ok: true, actor: { kind: "session", id: user.id, workspaceId: activeOrganizationId } };
    }
  }
  const [personal] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(and(eq(member.userId, user.id), eq(organization.personal, true)));
  if (!personal) return { ok: false, status: 403, error: "forbidden" };
  return { ok: true, actor: { kind: "session", id: user.id, workspaceId: personal.organizationId } };
};

const apiKeyActor = async (auth: Auth, headers: Headers): Promise<Resolution> => {
  const key = headers.get("x-api-key");
  if (!key) return UNAUTHORIZED;
  const result = await (auth.api as unknown as ApiKeyApi).verifyApiKey({ body: { key } });
  const verified = result.valid ? result.key : null;
  if (!verified) return UNAUTHORIZED;
  return {
    ok: true,
    actor: { kind: "api-key", id: verified.id, workspaceId: verified.referenceId },
  };
};

export const actorMiddleware =
  (auth: Auth, db: Db) =>
  async (c: Context, next: Next) => {
    const resolution =
      (await sessionActor(auth, db, c.req.raw.headers)) ?? (await apiKeyActor(auth, c.req.raw.headers));
    if (!resolution.ok) return c.json({ error: resolution.error }, resolution.status);
    c.set("actor", resolution.actor);
    await next();
  };
