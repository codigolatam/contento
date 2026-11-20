import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDatabase } from "./database";
import * as eventsModule from "./events";
import { listEvents, recordEvent } from "./events";

type Database = ReturnType<typeof createDatabase>;

const piece = { entityType: "piece", entityId: "piece-1" };
const draft = { entityType: "draft", entityId: "draft-9" };

const baseEvent = { ...piece, type: "piece.created", actor: "user-ada" };

const eventRows = (database: Database) => database.execute("SELECT * FROM event");

describe("events", () => {
  let database: Database;

  beforeEach(async () => {
    database = createDatabase("");
    await database.migrate();
  });

  afterEach(async () => {
    await database.close();
  });

  it("returns an empty list for an entity without events", async () => {
    expect(await listEvents(database.db, piece)).toEqual([]);
  });

  it("stores empty data when an event is recorded without it", async () => {
    const row = await recordEvent(database.db, baseEvent);

    expect(row.data).toEqual({});
    const [listed] = await listEvents(database.db, piece);
    expect(listed?.data).toEqual({});
  });

  it("keeps entity, type, actor, instant and data on a recorded event", async () => {
    const row = await recordEvent(database.db, {
      ...baseEvent,
      data: { title: "Hello" },
    });

    expect(row).toMatchObject({
      entityType: piece.entityType,
      entityId: piece.entityId,
      type: "piece.created",
      actor: "user-ada",
      data: { title: "Hello" },
    });
    expect(row.occurredAt).toBeInstanceOf(Date);
    expect(row.id).toBeTypeOf("number");

    const listed = await listEvents(database.db, piece);
    expect(listed.map((e) => e.id)).toEqual([row.id]);
  });

  it("lists the events of an entity in chronological order and excludes other entities", async () => {
    const first = await recordEvent(database.db, baseEvent);
    const other = await recordEvent(database.db, { ...draft, type: "draft.saved", actor: "key-1" });
    const sameId = await recordEvent(database.db, {
      entityType: "draft",
      entityId: piece.entityId,
      type: "draft.saved",
      actor: "key-1",
    });
    const sameType = await recordEvent(database.db, {
      entityType: piece.entityType,
      entityId: "draft-9",
      type: "piece.renamed",
      actor: "key-1",
    });
    const second = await recordEvent(database.db, {
      ...piece,
      type: "piece.published",
      actor: "key-1",
      data: { channel: "blog" },
    });

    const listed = await listEvents(database.db, piece);

    expect(listed.map((e) => e.id)).toEqual([first.id, second.id]);
    expect(listed.map((e) => e.type)).toEqual(["piece.created", "piece.published"]);
    expect((await listEvents(database.db, draft)).map((e) => e.id)).toEqual([other.id]);
    expect(
      (await listEvents(database.db, { entityType: "draft", entityId: piece.entityId })).map(
        (e) => e.id,
      ),
    ).toEqual([sameId.id]);
    expect(
      (await listEvents(database.db, { entityType: piece.entityType, entityId: "draft-9" })).map(
        (e) => e.id,
      ),
    ).toEqual([sameType.id]);
  });

  it("accepts entity.action types in lowercase and rejects other shapes", async () => {
    await recordEvent(database.db, { ...baseEvent, type: "piece.draft_created" });
    await recordEvent(database.db, { ...baseEvent, type: "zeta.event" });

    const invalidTypes = [
      "Piece.created",
      "piece.Created",
      "piececreated",
      "piece.",
      ".created",
      "piece..created",
      "piece.created.extra",
      "piece.cre-ated",
    ];
    for (const type of invalidTypes) {
      await expect(recordEvent(database.db, { ...baseEvent, type })).rejects.toThrow(
        "invalid event type",
      );
    }

    const listed = await listEvents(database.db, piece);
    expect(listed.map((e) => e.type)).toEqual(["piece.draft_created", "zeta.event"]);
  });

  it("exposes no update or delete operations for events", () => {
    expect(Object.keys(eventsModule).sort()).toEqual(["listEvents", "recordEvent"]);
  });

  it("discards an event recorded inside a rolled-back transaction and keeps a committed one", async () => {
    await expect(
      database.db.transaction(async (tx) => {
        await recordEvent(tx, { ...baseEvent, type: "piece.rolled" });
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(await listEvents(database.db, piece)).toEqual([]);

    await database.db.transaction(async (tx) => {
      await recordEvent(tx, { ...baseEvent, type: "piece.committed" });
    });

    expect((await listEvents(database.db, piece)).map((e) => e.type)).toEqual([
      "piece.committed",
    ]);
  });

  it("rejects an invalid type without writing the row", async () => {
    await expect(
      recordEvent(database.db, { ...baseEvent, type: "PIECE.CREATED" }),
    ).rejects.toThrow("invalid event type");

    expect((await eventRows(database)).rows).toEqual([]);
  });
});
