import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  closeDatabase,
  executeRun,
  executeSql,
  openDatabase,
  queryAll,
  queryOne,
  runInTransaction,
} from "../sqlite";
import { createTempDir, createTempDatabase } from "./testDb";

describe("sqlite helpers", () => {
  it("creates parent directories and configures expected pragmas", () => {
    const tempDir = createTempDir();
    const dbPath = path.join(tempDir, "nested", "app.sqlite");

    const db = openDatabase(dbPath);

    expect(fs.existsSync(path.dirname(dbPath))).toBe(true);
    expect(queryOne<{ foreign_keys: number }>(db, "PRAGMA foreign_keys")).toEqual({ foreign_keys: 1 });
    expect(queryOne<{ journal_mode: string }>(db, "PRAGMA journal_mode")).toEqual({ journal_mode: "wal" });

    closeDatabase(db);
  });

  it("executes writes and reads rows through the helper API", () => {
    const { db } = createTempDatabase();

    executeSql(db, "CREATE TABLE widgets (id TEXT PRIMARY KEY, label TEXT NOT NULL)");
    executeRun(db, "INSERT INTO widgets (id, label) VALUES (?, ?)", ["w-1", "Alpha"]);
    executeRun(db, "INSERT INTO widgets (id, label) VALUES (?, ?)", ["w-2", "Beta"]);

    expect(queryOne<{ id: string; label: string }>(db, "SELECT id, label FROM widgets WHERE id = ?", ["w-1"])).toEqual({
      id: "w-1",
      label: "Alpha",
    });
    expect(queryAll<{ id: string }>(db, "SELECT id FROM widgets ORDER BY id ASC")).toEqual([
      { id: "w-1" },
      { id: "w-2" },
    ]);
  });

  it("commits successful transactions", () => {
    const { db } = createTempDatabase();

    executeSql(db, "CREATE TABLE widgets (id TEXT PRIMARY KEY)");

    runInTransaction(db, () => {
      executeRun(db, "INSERT INTO widgets (id) VALUES (?)", ["w-1"]);
      executeRun(db, "INSERT INTO widgets (id) VALUES (?)", ["w-2"]);
    });

    expect(queryAll<{ id: string }>(db, "SELECT id FROM widgets ORDER BY id ASC")).toEqual([
      { id: "w-1" },
      { id: "w-2" },
    ]);
  });

  it("rolls back transactions when work throws", () => {
    const { db } = createTempDatabase();

    executeSql(db, "CREATE TABLE widgets (id TEXT PRIMARY KEY)");

    expect(() =>
      runInTransaction(db, () => {
        executeRun(db, "INSERT INTO widgets (id) VALUES (?)", ["w-1"]);
        throw new Error("stop");
      })
    ).toThrow("stop");

    expect(queryAll<{ id: string }>(db, "SELECT id FROM widgets")).toEqual([]);
  });

  it("closes the database connection", () => {
    const { db } = createTempDatabase();

    closeDatabase(db);

    expect(db.open).toBe(false);
  });
});
