import assert from "node:assert";
import { and, asc, eq } from "drizzle-orm";
import type { createDatabase } from "./database";
import { event } from "./schema";

type Database = ReturnType<typeof createDatabase>["db"];
type DbHandle = Pick<Database, "insert" | "select">;

const eventTypePattern = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

export interface NewEvent {
  entityType: string;
  entityId: string;
  type: string;
  actor: string;
  data?: unknown;
}

export const recordEvent = async (db: DbHandle, input: NewEvent) => {
  if (!eventTypePattern.test(input.type)) {
    throw new Error(`invalid event type: ${input.type}`);
  }
  const [row] = await db
    .insert(event)
    .values({
      entityType: input.entityType,
      entityId: input.entityId,
      type: input.type,
      actor: input.actor,
      data: input.data ?? {},
    })
    .returning();
  assert(row !== undefined);
  return row;
};

export const listEvents = async (
  db: DbHandle,
  entity: { entityType: string; entityId: string },
) =>
  db
    .select()
    .from(event)
    .where(and(eq(event.entityType, entity.entityType), eq(event.entityId, entity.entityId)))
    .orderBy(asc(event.occurredAt), asc(event.id));
