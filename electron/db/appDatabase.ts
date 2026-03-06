import { openDatabase, closeDatabase, type SqliteDatabase } from "./sqlite";
import { runMigrationsFromFiles } from "./runMigrations";

export interface AppDatabase {
  db: SqliteDatabase;
  close: () => void;
}

export function createAppDatabase(dbPath: string): AppDatabase {
  const db = openDatabase(dbPath);

  runMigrationsFromFiles(db);

  return {
    db,
    close: () => closeDatabase(db),
  };
}