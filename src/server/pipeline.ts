import type { Context, Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { actorLabel, actorMiddleware, type Actor } from "./actor";
import type { createAuth } from "./auth";
import type { createDatabase } from "./database";
import {
  HttpError,
  approvePiece,
  createDocument,
  createPiece,
  deleteDocument,
  findPiece,
  getPiece,
  linkDocument,
  listDocuments,
  listPieces,
  lockedPiecesForDocument,
  unlinkDocument,
  updatePieceFields,
  type PieceFields,
} from "./pieces";

type Database = ReturnType<typeof createDatabase>;
type Db = Database["db"];
type Auth = ReturnType<typeof createAuth>;

const PIECE_FIELD_KEYS = ["topic", "readerQuestion", "angle"] as const;

const handle =
  (fn: (c: Context) => Promise<Response>) =>
  async (c: Context) => {
    try {
      return await fn(c);
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.error, ...(error.details ?? {}) }, error.status as ContentfulStatusCode);
      }
      throw error;
    }
  };

const parseBody = async (c: Context): Promise<Record<string, unknown>> => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new HttpError(400, "invalid_json");
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "invalid_json");
  }
  return body as Record<string, unknown>;
};

const pieceFields = (body: Record<string, unknown>): PieceFields => {
  const fields: PieceFields = {};
  for (const key of PIECE_FIELD_KEYS) {
    const value = body[key];
    if (value === undefined) continue;
    if (typeof value !== "string") throw new HttpError(400, "invalid_field", { field: key });
    fields[key] = value;
  }
  return fields;
};

const actor = (c: Context): Actor => c.get("actor") as Actor;

const param = (c: Context, name: string) => String(c.req.param(name));

export const mountPipeline = (app: Hono, deps: { db: Db; auth: Auth }) => {
  const { db, auth } = deps;
  app.use("/api/pieces", actorMiddleware(auth, db));
  app.use("/api/pieces/*", actorMiddleware(auth, db));
  app.use("/api/documents", actorMiddleware(auth, db));
  app.use("/api/documents/*", actorMiddleware(auth, db));

  app.post(
    "/api/pieces",
    handle(async (c) => {
      const body = await parseBody(c);
      const row = await createPiece(
        db,
        { workspaceId: actor(c).workspaceId, ...pieceFields(body) },
        actorLabel(actor(c)),
      );
      return c.json(row, 201);
    }),
  );

  app.get(
    "/api/pieces",
    handle(async (c) => c.json(await listPieces(db, actor(c).workspaceId))),
  );

  app.get(
    "/api/pieces/:id",
    handle(async (c) => c.json(await getPiece(db, actor(c).workspaceId, param(c, "id")))),
  );

  app.patch(
    "/api/pieces/:id",
    handle(async (c) => {
      const body = await parseBody(c);
      const row = await updatePieceFields(
        db,
        actor(c).workspaceId,
        param(c, "id"),
        pieceFields(body),
      );
      return c.json(row);
    }),
  );

  app.post(
    "/api/pieces/:id/approve",
    handle(async (c) => {
      if (actor(c).kind !== "session") return c.json({ error: "forbidden" }, 403);
      const row = await approvePiece(
        db,
        actor(c).workspaceId,
        param(c, "id"),
        actorLabel(actor(c)),
      );
      return c.json(row);
    }),
  );

  app.post(
    "/api/documents",
    handle(async (c) => {
      const body = await parseBody(c);
      const { type, title, body: text, link, pieceIds } = body;
      if (type !== undefined && type !== "resource") {
        throw new HttpError(400, "invalid_document_type");
      }
      if (typeof title !== "string" || title.trim() === "") {
        throw new HttpError(400, "invalid_title");
      }
      for (const key of ["body", "link"] as const) {
        if (body[key] !== undefined && typeof body[key] !== "string") {
          throw new HttpError(400, "invalid_field", { field: key });
        }
      }
      if (
        pieceIds !== undefined &&
        (!Array.isArray(pieceIds) || pieceIds.some((id) => typeof id !== "string"))
      ) {
        throw new HttpError(400, "invalid_piece_ids");
      }
      const row = await createDocument(db, {
        workspaceId: actor(c).workspaceId,
        type: "resource",
        title,
        body: text as string | undefined,
        link: link as string | undefined,
        pieceIds: pieceIds as string[] | undefined,
      });
      return c.json(row, 201);
    }),
  );

  app.get(
    "/api/documents",
    handle(async (c) => c.json(await listDocuments(db, actor(c).workspaceId, "resource"))),
  );

  app.delete(
    "/api/documents/:id",
    handle(async (c) => {
      const documentId = param(c, "id");
      const locked = await lockedPiecesForDocument(db, actor(c).workspaceId, documentId);
      if (actor(c).kind === "api-key" && locked.length > 0) {
        return c.json({ error: "forbidden" }, 403);
      }
      await deleteDocument(db, actor(c).workspaceId, documentId);
      return c.body(null, 204);
    }),
  );

  app.post(
    "/api/pieces/:id/links",
    handle(async (c) => {
      const body = await parseBody(c);
      if (typeof body.documentId !== "string" || body.documentId === "") {
        throw new HttpError(400, "invalid_document_id");
      }
      const link = await linkDocument(
        db,
        actor(c).workspaceId,
        param(c, "id"),
        body.documentId,
      );
      return c.json(link, 201);
    }),
  );

  app.delete(
    "/api/pieces/:id/links/:documentId",
    handle(async (c) => {
      const pieceId = param(c, "id");
      const target = await findPiece(db, actor(c).workspaceId, pieceId);
      if (target.status !== "proposal" && actor(c).kind === "api-key") {
        return c.json({ error: "forbidden" }, 403);
      }
      await unlinkDocument(db, pieceId, param(c, "documentId"));
      return c.body(null, 204);
    }),
  );
};
