import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { and, asc, eq, ne } from "drizzle-orm";
import type { createDatabase } from "./database";
import { recordEvent } from "./events";
import { document, piece, pieceDocument } from "./schema";

type Database = ReturnType<typeof createDatabase>;
type Db = Database["db"];
type DbHandle = Pick<Db, "select" | "insert" | "update" | "delete">;

export const PIECE_STATUSES = [
  "proposal",
  "idea_approved",
  "drafting",
  "ready",
  "discarded",
] as const;
export type PieceStatus = (typeof PIECE_STATUSES)[number];

export const DOCUMENT_TYPES = ["resource", "draft"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const REQUIREMENTS = ["topic", "readerQuestion", "angle", "support"] as const;
export type Requirement = (typeof REQUIREMENTS)[number];

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly error: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(error);
  }
}

type PieceRow = typeof piece.$inferSelect;

export interface PieceFields {
  topic?: string;
  readerQuestion?: string;
  angle?: string;
}

const cleanField = (value: string | undefined) => {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const cleanFields = (fields: PieceFields) => ({
  ...(fields.topic !== undefined ? { topic: cleanField(fields.topic) } : {}),
  ...(fields.readerQuestion !== undefined
    ? { readerQuestion: cleanField(fields.readerQuestion) }
    : {}),
  ...(fields.angle !== undefined ? { angle: cleanField(fields.angle) } : {}),
});

export const findPiece = async (db: DbHandle, workspaceId: string, pieceId: string) => {
  const [row] = await db
    .select()
    .from(piece)
    .where(and(eq(piece.id, pieceId), eq(piece.workspaceId, workspaceId)));
  if (!row) throw new HttpError(404, "piece_not_found");
  return row;
};

const supportCount = async (db: DbHandle, pieceId: string) => {
  const rows = await db
    .select({ documentId: pieceDocument.documentId })
    .from(pieceDocument)
    .innerJoin(document, eq(pieceDocument.documentId, document.id))
    .where(and(eq(pieceDocument.pieceId, pieceId), eq(document.type, "resource")));
  return rows.length;
};

export const missingRequirements = (row: PieceRow, support: number): Requirement[] => {
  const missing: Requirement[] = [];
  if (!row.topic?.trim()) missing.push("topic");
  if (!row.readerQuestion?.trim()) missing.push("readerQuestion");
  if (!row.angle?.trim()) missing.push("angle");
  if (support === 0) missing.push("support");
  return missing;
};

export const maturityOf = (row: PieceRow, support: number) =>
  REQUIREMENTS.length - missingRequirements(row, support).length;

export const createPiece = async (
  db: Db,
  input: { workspaceId: string } & PieceFields,
  actor: string,
) =>
  db.transaction(async (tx) => {
    const [row] = await tx
      .insert(piece)
      .values({
        id: randomUUID(),
        workspaceId: input.workspaceId,
        ...cleanFields(input),
      })
      .returning();
    assert(row !== undefined);
    await recordEvent(tx, {
      entityType: "piece",
      entityId: row.id,
      type: "piece.created",
      actor,
      data: { status: row.status },
    });
    return row;
  });

export const listPieces = async (db: DbHandle, workspaceId: string) => {
  const rows = await db
    .select()
    .from(piece)
    .where(eq(piece.workspaceId, workspaceId))
    .orderBy(asc(piece.createdAt), asc(piece.id));
  const supportRows = await db
    .select({ pieceId: pieceDocument.pieceId })
    .from(pieceDocument)
    .innerJoin(document, eq(pieceDocument.documentId, document.id))
    .innerJoin(piece, eq(pieceDocument.pieceId, piece.id))
    .where(and(eq(piece.workspaceId, workspaceId), eq(document.type, "resource")));
  const counts = new Map<string, number>();
  for (const row of supportRows) {
    counts.set(row.pieceId, (counts.get(row.pieceId) ?? 0) + 1);
  }
  return rows.map((row) => {
    const support = counts.get(row.id) ?? 0;
    return { ...row, maturity: maturityOf(row, support) };
  });
};

export const getPiece = async (db: DbHandle, workspaceId: string, pieceId: string) => {
  const row = await findPiece(db, workspaceId, pieceId);
  const documents = await db
    .select({ document })
    .from(pieceDocument)
    .innerJoin(document, eq(pieceDocument.documentId, document.id))
    .where(eq(pieceDocument.pieceId, row.id));
  const linked = documents.map((entry) => entry.document);
  const support = await supportCount(db, row.id);
  return {
    piece: { ...row, maturity: maturityOf(row, support), missing: missingRequirements(row, support) },
    documents: linked,
  };
};

export const updatePieceFields = async (
  db: DbHandle,
  workspaceId: string,
  pieceId: string,
  fields: PieceFields,
) => {
  const existing = await findPiece(db, workspaceId, pieceId);
  if (existing.fieldsFrozen) throw new HttpError(409, "fields_frozen");
  const updates = cleanFields(fields);
  if (Object.keys(updates).length === 0) return existing;
  const [row] = await db
    .update(piece)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(piece.id, existing.id))
    .returning();
  return row;
};

export const approvePiece = async (db: Db, workspaceId: string, pieceId: string, actor: string) =>
  db.transaction(async (tx) => {
    const existing = await findPiece(tx, workspaceId, pieceId);
    if (existing.status !== "proposal") {
      throw new HttpError(409, "invalid_transition", { from: existing.status });
    }
    const missing = missingRequirements(existing, await supportCount(tx, existing.id));
    if (missing.length > 0) {
      throw new HttpError(409, "requirements_missing", { missing });
    }
    const [row] = await tx
      .update(piece)
      .set({ status: "idea_approved", fieldsFrozen: true, updatedAt: new Date() })
      .where(eq(piece.id, existing.id))
      .returning();
    assert(row !== undefined);
    await recordEvent(tx, {
      entityType: "piece",
      entityId: row.id,
      type: "piece.approved",
      actor,
      data: {
        topic: existing.topic,
        readerQuestion: existing.readerQuestion,
        angle: existing.angle,
      },
    });
    return row;
  });

export const createDocument = async (
  db: Db,
  input: {
    workspaceId: string;
    type: DocumentType;
    title: string;
    body?: string;
    link?: string;
    pieceIds?: string[];
  },
) =>
  db.transaction(async (tx) => {
    const [row] = await tx
      .insert(document)
      .values({
        id: randomUUID(),
        workspaceId: input.workspaceId,
        type: input.type,
        title: input.title.trim(),
        body: cleanField(input.body),
        link: cleanField(input.link),
      })
      .returning();
    assert(row !== undefined);
    for (const pieceId of input.pieceIds ?? []) {
      const target = await tx
        .select({ id: piece.id })
        .from(piece)
        .where(and(eq(piece.id, pieceId), eq(piece.workspaceId, input.workspaceId)));
      if (target.length === 0) throw new HttpError(404, "piece_not_found");
      await tx
        .insert(pieceDocument)
        .values({ pieceId, documentId: row.id })
        .onConflictDoNothing();
    }
    return row;
  });

export const listDocuments = async (db: DbHandle, workspaceId: string, type: DocumentType) => {
  const rows = await db
    .select()
    .from(document)
    .where(and(eq(document.workspaceId, workspaceId), eq(document.type, type)))
    .orderBy(asc(document.createdAt), asc(document.id));
  const links = await db
    .select({ pieceId: pieceDocument.pieceId, documentId: pieceDocument.documentId })
    .from(pieceDocument)
    .innerJoin(document, eq(pieceDocument.documentId, document.id))
    .where(and(eq(document.workspaceId, workspaceId), eq(document.type, type)));
  const byDocument = new Map<string, string[]>();
  for (const link of links) {
    const list = byDocument.get(link.documentId) ?? [];
    list.push(link.pieceId);
    byDocument.set(link.documentId, list);
  }
  return rows.map((row) => ({ ...row, pieceIds: byDocument.get(row.id) ?? [] }));
};

export const findDocument = async (db: DbHandle, workspaceId: string, documentId: string) => {
  const [row] = await db
    .select()
    .from(document)
    .where(and(eq(document.id, documentId), eq(document.workspaceId, workspaceId)));
  if (!row) throw new HttpError(404, "document_not_found");
  return row;
};

export const lockedPiecesForDocument = async (db: DbHandle, workspaceId: string, documentId: string) =>
  db
    .select({ id: piece.id, status: piece.status })
    .from(pieceDocument)
    .innerJoin(piece, eq(pieceDocument.pieceId, piece.id))
    .where(
      and(
        eq(pieceDocument.documentId, documentId),
        eq(piece.workspaceId, workspaceId),
        ne(piece.status, "proposal"),
      ),
    );

export const deleteDocument = async (db: DbHandle, workspaceId: string, documentId: string) => {
  const existing = await findDocument(db, workspaceId, documentId);
  await db.delete(document).where(eq(document.id, existing.id));
  return existing;
};

export const linkDocument = async (
  db: Db,
  workspaceId: string,
  pieceId: string,
  documentId: string,
) =>
  db.transaction(async (tx) => {
    await findPiece(tx, workspaceId, pieceId);
    const target = await findDocument(tx, workspaceId, documentId);
    if (target.type !== "resource") {
      throw new HttpError(400, "only_resources_linkable");
    }
    await tx
      .insert(pieceDocument)
      .values({ pieceId, documentId })
      .onConflictDoNothing();
    return { pieceId, documentId };
  });

export const unlinkDocument = async (db: DbHandle, pieceId: string, documentId: string) => {
  await db
    .delete(pieceDocument)
    .where(and(eq(pieceDocument.pieceId, pieceId), eq(pieceDocument.documentId, documentId)));
};
