import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTempDatabase, createTempDir } from "./testDb";

const originalResourcesPathDescriptor = Object.getOwnPropertyDescriptor(process, "resourcesPath");

function setResourcesPath(resourcesPath: string): void {
  Object.defineProperty(process, "resourcesPath", {
    configurable: true,
    value: resourcesPath,
    writable: true,
  });
}

afterEach(() => {
  vi.resetModules();
  vi.unmock("electron");
  if (originalResourcesPathDescriptor) {
    Object.defineProperty(process, "resourcesPath", originalResourcesPathDescriptor);
  } else {
    Reflect.deleteProperty(process, "resourcesPath");
  }
});

async function importRunMigrations(isPackaged: boolean) {
  vi.doMock("electron", () => ({
    app: {
      isPackaged,
    },
  }));

  return import("../runMigrations");
}

describe("runMigrationsFromFiles", () => {
  it("applies the real schema migration on first run", async () => {
    const { db } = createTempDatabase();
    const { runMigrationsFromFiles } = await importRunMigrations(false);

    runMigrationsFromFiles(db);

    expect(
      db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('projects', 'corpora', 'corpus_files_path')")
        .all()
    ).toEqual([
      { name: "projects" },
      { name: "corpora" },
      { name: "corpus_files_path" },
    ]);
    expect(
      db.prepare("SELECT name FROM schema_migrations ORDER BY name ASC").all()
    ).toEqual([{ name: "0001_core_entities.sql" }]);
  });

  it("is idempotent across repeated runs", async () => {
    const { db } = createTempDatabase();
    const { runMigrationsFromFiles } = await importRunMigrations(false);

    runMigrationsFromFiles(db);
    runMigrationsFromFiles(db);

    expect(db.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get()).toEqual({ count: 1 });
  });

  it("applies packaged migrations in filename order", async () => {
    const tempDir = createTempDir();
    const migrationsDir = path.join(tempDir, "db-migration");

    fs.mkdirSync(migrationsDir, { recursive: true });
    fs.writeFileSync(
      path.join(migrationsDir, "0002_second.sql"),
      "INSERT INTO ordered_steps (step_name) VALUES ('second');"
    );
    fs.writeFileSync(
      path.join(migrationsDir, "0001_first.sql"),
      "CREATE TABLE ordered_steps (step_name TEXT PRIMARY KEY); INSERT INTO ordered_steps (step_name) VALUES ('first');"
    );

    setResourcesPath(tempDir);

    const { db } = createTempDatabase();
    const { runMigrationsFromFiles } = await importRunMigrations(true);

    runMigrationsFromFiles(db);

    expect(
      db.prepare("SELECT step_name FROM ordered_steps ORDER BY rowid ASC").all()
    ).toEqual([{ step_name: "first" }, { step_name: "second" }]);
    expect(
      db.prepare("SELECT name FROM schema_migrations ORDER BY name ASC").all()
    ).toEqual([{ name: "0001_first.sql" }, { name: "0002_second.sql" }]);
  });

  it("rolls back a failing migration file without marking it applied", async () => {
    const tempDir = createTempDir();
    const migrationsDir = path.join(tempDir, "db-migration");

    fs.mkdirSync(migrationsDir, { recursive: true });
    fs.writeFileSync(
      path.join(migrationsDir, "0001_failure.sql"),
      [
        "CREATE TABLE partial_table (id TEXT PRIMARY KEY);",
        "INSERT INTO partial_table (id) VALUES ('first');",
        "INSERT INTO missing_table (id) VALUES ('boom');",
      ].join("\n")
    );

    setResourcesPath(tempDir);

    const { db } = createTempDatabase();
    const { runMigrationsFromFiles } = await importRunMigrations(true);

    expect(() => runMigrationsFromFiles(db)).toThrow(/missing_table/i);
    expect(
      db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'partial_table'").get()
    ).toBeUndefined();
    expect(db.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get()).toEqual({ count: 0 });
  });

  it("returns cleanly when the migrations directory does not exist", async () => {
    const tempDir = createTempDir();
    setResourcesPath(tempDir);

    const { db } = createTempDatabase();
    const { runMigrationsFromFiles } = await importRunMigrations(true);

    expect(() => runMigrationsFromFiles(db)).not.toThrow();
    expect(db.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get()).toEqual({ count: 0 });
  });
});
