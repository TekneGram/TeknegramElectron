import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type SqliteDatabase = Database.Database;

export function openDatabase(dbPath: string): SqliteDatabase {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  return db;
}

export function closeDatabase(db: SqliteDatabase): void {
  db.close();
}

export function executeSql(db: SqliteDatabase, sql: string): void {
  db.exec(sql);
}

export function executeRun(db: SqliteDatabase, sql: string, params: unknown[] = []): void {
  db.prepare(sql).run(...params);
}

export function queryAll<T>(db: SqliteDatabase, sql: string, params: unknown[] = []): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function queryOne<T>(db: SqliteDatabase, sql: string, params: unknown[] = []): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function runInTransaction<T>(
  db: SqliteDatabase,
  work: () => T
): T {
  const transaction = db.transaction(work);
  return transaction();
}