import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach } from "vitest";
import { closeDatabase, executeSql, openDatabase, type SqliteDatabase } from "../sqlite";

type TempDbContext = {
  db: SqliteDatabase;
  dbPath: string;
  tempDir: string;
};

const cleanupCallbacks: Array<() => void> = [];

afterEach(() => {
  while (cleanupCallbacks.length > 0) {
    const callback = cleanupCallbacks.pop();
    callback?.();
  }
});

export function createTempDir(prefix = "electron-db-test-"): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

  cleanupCallbacks.push(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  return tempDir;
}

export function createTempDatabase(prefix?: string): TempDbContext {
  const tempDir = createTempDir(prefix);
  const dbPath = path.join(tempDir, "test.sqlite");
  const db = openDatabase(dbPath);

  cleanupCallbacks.push(() => {
    if (db.open) {
      closeDatabase(db);
    }
  });

  return { db, dbPath, tempDir };
}

export function applyCoreSchema(db: SqliteDatabase): void {
  const migrationSql = fs.readFileSync(
    path.join(process.cwd(), "electron", "db", "migration", "0001_core_entities.sql"),
    "utf8"
  );

  executeSql(db, migrationSql);
}
