import { openDatabase, closeDatabase, type SqliteDatabase } from "./sqlite";

export interface AppDatabase {
  db: SqliteDatabase;
  close: () => void;
}

export function createAppDatabase(dbPath: string): AppDatabase {
  const db = openDatabase(dbPath);

  return {
    db,
    close: () => closeDatabase(db),
  };
}