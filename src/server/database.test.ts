import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createDatabase } from "./database";

type Database = ReturnType<typeof createDatabase>;

const openDatabases: Database[] = [];

const open = (folder: string, connectionString = "") => {
  const database = createDatabase(connectionString, folder);
  openDatabases.push(database);
  return database;
};

const unreachableUrl = "postgres://user:secret@127.0.0.1:1/contento";

const writeMigrations = async (folder: string, migrations: Record<string, string>) => {
  await mkdir(join(folder, "meta"), { recursive: true });
  const entries = Object.keys(migrations).map((tag, idx) => ({
    idx,
    version: "7",
    when: idx + 1,
    tag,
    breakpoints: true,
  }));
  await writeFile(
    join(folder, "meta", "_journal.json"),
    JSON.stringify({ version: "7", dialect: "postgresql", entries }),
  );
  for (const [tag, sql] of Object.entries(migrations)) {
    await writeFile(join(folder, `${tag}.sql`), sql);
  }
};

describe("database", () => {
  let fixtureRoot: string;
  let emptyMigrations: string;
  let probeMigrations: string;
  let twoMigrations: string;

  beforeAll(async () => {
    fixtureRoot = await mkdtemp(join(tmpdir(), "contento-migrations-"));
    emptyMigrations = join(fixtureRoot, "empty");
    probeMigrations = join(fixtureRoot, "probe");
    twoMigrations = join(fixtureRoot, "two");

    await writeMigrations(emptyMigrations, {});
    await writeMigrations(probeMigrations, {
      "0000_create_probe": "CREATE TABLE probe (id integer PRIMARY KEY);",
    });
    await writeMigrations(twoMigrations, {
      "0000_create_probe": "CREATE TABLE probe (id integer PRIMARY KEY);",
      "0001_create_second": "CREATE TABLE second (id integer PRIMARY KEY);",
    });
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    for (const database of openDatabases.splice(0)) await database.close();
  });

  afterAll(async () => {
    await rm(fixtureRoot, { recursive: true, force: true });
  });

  it("answers SELECT 1 when DATABASE_URL is empty", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const database = createDatabase(undefined, emptyMigrations);
    openDatabases.push(database);

    const result = await database.execute("SELECT 1 AS value");

    expect(result.rows).toEqual([{ value: 1 }]);
  });

  it("fails to connect when DATABASE_URL points to an unreachable server", async () => {
    vi.stubEnv("DATABASE_URL", unreachableUrl);
    const database = createDatabase(undefined, emptyMigrations);
    openDatabases.push(database);

    await expect(database.execute("SELECT 1")).rejects.toMatchObject({ code: "ECONNREFUSED" });
  });

  it("applies an empty migration set without creating tables", async () => {
    const database = open(emptyMigrations);

    await database.migrate();
    const tables = await database.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );

    expect(tables.rows).toEqual([]);
  });

  it("creates the table of a pending migration", async () => {
    const database = open(probeMigrations);

    await database.migrate();
    const tables = await database.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );

    expect(tables.rows).toEqual([{ table_name: "probe" }]);
  });

  it("creates the tables of every pending migration", async () => {
    const database = open(twoMigrations);

    await database.migrate();
    const tables = await database.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );

    expect(tables.rows).toEqual([{ table_name: "probe" }, { table_name: "second" }]);
  });

  it("records a migration once when migrating twice in a row", async () => {
    const database = open(probeMigrations);

    await database.migrate();
    await database.migrate();
    const applied = await database.execute("SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations");

    expect(applied.rows).toEqual([{ count: 1 }]);
  });

  it("rejects migrations when the server refuses the connection", async () => {
    const database = open(emptyMigrations, unreachableUrl);

    await expect(database.migrate()).rejects.toMatchObject({
      cause: { code: "ECONNREFUSED" },
    });
  });

  it("exposes a drizzle instance, the query helper, and the migration helper", () => {
    const database = open(emptyMigrations);

    expect(Reflect.get(database.db, "select")).toBeTypeOf("function");
    expect(database.execute).toBeTypeOf("function");
    expect(database.migrate).toBeTypeOf("function");
  });
});
