import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { electronApp } = vi.hoisted(() => ({
  electronApp: { isPackaged: false },
}));

vi.mock("electron", () => ({
  app: electronApp,
}));

import { runMigrationsFromFiles } from "../runMigrations";

const originalResourcesPathDescriptor = Object.getOwnPropertyDescriptor(process, "resourcesPath");

function setResourcesPath(resourcesPath: string): void {
  Object.defineProperty(process, "resourcesPath", {
    configurable: true,
    value: resourcesPath,
    writable: true,
  });
}

function createMockDb() {
  const exec = vi.fn();
  const selectAppliedGet = vi.fn();
  const markAppliedRun = vi.fn();
  const transaction = vi.fn((work: () => void) => () => work());

  const prepare = vi.fn((sql: string) => {
    if (sql.includes("SELECT 1 FROM schema_migrations")) {
      return { get: selectAppliedGet };
    }

    if (sql.includes("INSERT INTO schema_migrations")) {
      return { run: markAppliedRun };
    }

    throw new Error(`Unexpected SQL prepared in test: ${sql}`);
  });

  return {
    db: {
      exec,
      prepare,
      transaction,
    },
    exec,
    prepare,
    selectAppliedGet,
    markAppliedRun,
    transaction,
  };
}

describe("runMigrationsFromFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    electronApp.isPackaged = false;
  });

  afterEach(() => {
    if (originalResourcesPathDescriptor) {
      Object.defineProperty(process, "resourcesPath", originalResourcesPathDescriptor);
    } else {
      Reflect.deleteProperty(process, "resourcesPath");
    }
  });

  it("creates the schema migrations table and returns cleanly when the directory does not exist", () => {
    const { db, exec, prepare } = createMockDb();
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    expect(() => runMigrationsFromFiles(db as never)).not.toThrow();

    expect(exec).toHaveBeenCalledWith(expect.stringContaining("CREATE TABLE IF NOT EXISTS schema_migrations"));
    expect(fs.existsSync).toHaveBeenCalledWith(
      path.join(process.cwd(), "electron", "db", "migration"),
    );
    expect(prepare).not.toHaveBeenCalled();
  });

  it("applies dev migrations in filename order and records each applied file", () => {
    const { db, exec, selectAppliedGet, markAppliedRun } = createMockDb();
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readdirSync").mockReturnValue(["0002_second.sql", "notes.txt", "0001_first.sql"] as never);
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath) => {
      if (String(filePath).endsWith("0001_first.sql")) {
        return "SQL FIRST" as never;
      }

      return "SQL SECOND" as never;
    });
    selectAppliedGet.mockReturnValue(undefined);

    runMigrationsFromFiles(db as never);

    expect(selectAppliedGet).toHaveBeenNthCalledWith(1, "0001_first.sql");
    expect(selectAppliedGet).toHaveBeenNthCalledWith(2, "0002_second.sql");
    expect(exec).toHaveBeenNthCalledWith(2, "SQL FIRST");
    expect(exec).toHaveBeenNthCalledWith(3, "SQL SECOND");
    expect(markAppliedRun).toHaveBeenNthCalledWith(1, "0001_first.sql");
    expect(markAppliedRun).toHaveBeenNthCalledWith(2, "0002_second.sql");
  });

  it("skips migrations that are already applied", () => {
    const { db, exec, selectAppliedGet, markAppliedRun } = createMockDb();
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readdirSync").mockReturnValue(["0001_first.sql", "0002_second.sql"] as never);
    vi.spyOn(fs, "readFileSync").mockReturnValue("SQL SECOND" as never);
    selectAppliedGet.mockImplementation((fileName: string) =>
      fileName === "0001_first.sql" ? { one: 1 } : undefined,
    );

    runMigrationsFromFiles(db as never);

    expect(exec).toHaveBeenCalledTimes(2);
    expect(exec).toHaveBeenLastCalledWith("SQL SECOND");
    expect(markAppliedRun).toHaveBeenCalledTimes(1);
    expect(markAppliedRun).toHaveBeenCalledWith("0002_second.sql");
  });

  it("uses the packaged migrations directory when Electron is packaged", () => {
    const { db } = createMockDb();
    electronApp.isPackaged = true;
    setResourcesPath("/bundle/resources");
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    runMigrationsFromFiles(db as never);

    expect(fs.existsSync).toHaveBeenCalledWith("/bundle/resources/db-migration");
  });

  it("propagates a migration error and does not mark the failed file as applied", () => {
    const { db, exec, selectAppliedGet, markAppliedRun } = createMockDb();
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readdirSync").mockReturnValue(["0001_failure.sql"] as never);
    vi.spyOn(fs, "readFileSync").mockReturnValue("BROKEN SQL" as never);
    selectAppliedGet.mockReturnValue(undefined);
    exec.mockImplementation((sql: string) => {
      if (sql === "BROKEN SQL") {
        throw new Error("missing_table");
      }
    });

    expect(() => runMigrationsFromFiles(db as never)).toThrow(/missing_table/i);
    expect(markAppliedRun).not.toHaveBeenCalled();
  });
});
