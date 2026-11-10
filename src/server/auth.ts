import { APIError, betterAuth, getCurrentAdapter } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultRoles, defaultStatements } from "better-auth/plugins/organization/access";
import type { Hono } from "hono";
import { createDatabase } from "./database";

type Database = ReturnType<typeof createDatabase>;
type Adapter = Awaited<ReturnType<typeof getCurrentAdapter>>;

const ac = createAccessControl({
  ...defaultStatements,
  apiKey: ["create", "read", "update", "delete"],
} as const);

const adminPermissions = {
  organization: ["update"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  apiKey: ["create", "read", "update", "delete"],
} as const;

const memberPermissions = {
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"],
  apiKey: [],
} as const;

const autorPermissions = {
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"],
  apiKey: [],
} as const;

const editorPermissions = {
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"],
  apiKey: [],
} as const;

const roles = {
  ...defaultRoles,
  admin: ac.newRole(adminPermissions),
  member: ac.newRole(memberPermissions),
  autor: ac.newRole(autorPermissions),
  editor: ac.newRole(editorPermissions),
};

export const createPersonalWorkspace = async (adapter: Adapter, userId: string) => {
  const user = await adapter.findOne<{ name: string }>({
    model: "user",
    where: [{ field: "id", value: userId }],
  });
  if (!user) return;
  const memberships = await adapter.findMany<{ organizationId: string }>({
    model: "member",
    where: [{ field: "userId", value: userId }],
  });
  for (const membership of memberships) {
    const personalWorkspace = await adapter.findOne({
      model: "organization",
      where: [
        { field: "id", value: membership.organizationId },
        { field: "personal", value: true },
      ],
    });
    if (personalWorkspace) return;
  }
  const workspace = await adapter.create<
    { name: string; slug: string; personal: boolean; createdAt: Date },
    { id: string }
  >({
    model: "organization",
    data: {
      name: user.name,
      slug: `personal-${userId}`,
      personal: true,
      createdAt: new Date(),
    },
  });
  await adapter.create({
    model: "member",
    data: {
      organizationId: workspace.id,
      userId,
      role: "owner",
      createdAt: new Date(),
    },
  });
};

export const createAuth = (
  database: Database,
  overrides?: { createPersonalWorkspace?: (adapter: Adapter, userId: string) => Promise<void> },
) => {
  const options: BetterAuthOptions = {
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(database.db, { provider: "pg", transaction: true }),
    emailAndPassword: { enabled: true },
    plugins: [
      organization({
        ac,
        roles,
        schema: {
          organization: {
            additionalFields: {
              personal: { type: "boolean", required: true, defaultValue: false, input: false },
            },
          },
        },
        organizationHooks: {
          beforeDeleteOrganization: async ({ organization: workspace }, ctx) => {
            if (workspace.personal === true) {
              throw new APIError("FORBIDDEN", {
                message: "personal workspaces cannot be deleted",
              });
            }
            await ctx?.context.adapter.deleteMany({
              model: "apikey",
              where: [{ field: "referenceId", value: workspace.id }],
            });
          },
        },
      }),
      apiKey({ references: "organization", rateLimit: { enabled: false } }),
    ],
    databaseHooks: {
      account: {
        create: {
          before: async (account) => {
            const { adapter: baseAdapter } = await instance.$context;
            const adapter = await getCurrentAdapter(baseAdapter);
            await (overrides?.createPersonalWorkspace ?? createPersonalWorkspace)(
              adapter,
              account.userId,
            );
          },
        },
      },
    },
  };
  const instance = betterAuth(options);
  return instance;
};

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
