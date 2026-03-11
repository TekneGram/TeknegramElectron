import fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { DatabaseMock } = vi.hoisted(() => ({
  DatabaseMock: vi.fn(),
}));

vi.mock("better-sqlite3", () => ({
  default: DatabaseMock,
}));

import {
  closeDatabase,
  executeRun,
  executeSql,
  openDatabase,
  queryAll,
  queryOne,
  runInTransaction,
} from "../sqlite";

function createMockDb() {
  const pragma = vi.fn();
  const close = vi.fn();
  const exec = vi.fn();
  const run = vi.fn();
  const all = vi.fn();
  const get = vi.fn();
  const prepare = vi.fn(() => ({ run, all, get }));
  const transactionWrapper = vi.fn((work: () => unknown) => () => work());

  return {
    db: {
      pragma,
      close,
      exec,
      prepare,
      transaction: transactionWrapper,
    },
    pragma,
    close,
    exec,
    run,
    all,
    get,
    prepare,
    transactionWrapper,
  };
}

describe("sqlite helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates parent directories and configures the expected pragmas when opening a database", () => {
    const { db, pragma } = createMockDb();
    DatabaseMock.mockReturnValue(db);
    vi.spyOn(fs, "mkdirSync").mockImplementation(() => undefined as never);

    const result = openDatabase("/tmp/nested/app.sqlite");

    expect(fs.mkdirSync).toHaveBeenCalledWith("/tmp/nested", { recursive: true });
    expect(DatabaseMock).toHaveBeenCalledWith("/tmp/nested/app.sqlite");
    expect(pragma).toHaveBeenNthCalledWith(1, "foreign_keys = ON");
    expect(pragma).toHaveBeenNthCalledWith(2, "journal_mode = WAL");
    expect(result).toBe(db);
  });

  it("closes the database connection through the wrapped helper", () => {
    const { db, close } = createMockDb();

    closeDatabase(db as never);

    expect(close).toHaveBeenCalled();
  });

  it("executes raw SQL through db.exec", () => {
    const { db, exec } = createMockDb();

    executeSql(db as never, "CREATE TABLE widgets (id TEXT PRIMARY KEY)");

    expect(exec).toHaveBeenCalledWith("CREATE TABLE widgets (id TEXT PRIMARY KEY)");
  });

  it("executes prepared statements with parameters", () => {
    const { db, prepare, run } = createMockDb();

    executeRun(db as never, "INSERT INTO widgets (id, label) VALUES (?, ?)", ["w-1", "Alpha"]);

    expect(prepare).toHaveBeenCalledWith("INSERT INTO widgets (id, label) VALUES (?, ?)");
    expect(run).toHaveBeenCalledWith("w-1", "Alpha");
  });

  it("queries all rows and one row through prepared statements", () => {
    const { db, prepare, all, get } = createMockDb();
    all.mockReturnValue([{ id: "w-1" }]);
    get.mockReturnValue({ id: "w-2" });

    expect(queryAll(db as never, "SELECT id FROM widgets")).toEqual([{ id: "w-1" }]);
    expect(queryOne(db as never, "SELECT id FROM widgets WHERE id = ?", ["w-2"])).toEqual({ id: "w-2" });
    expect(prepare).toHaveBeenNthCalledWith(1, "SELECT id FROM widgets");
    expect(prepare).toHaveBeenNthCalledWith(2, "SELECT id FROM widgets WHERE id = ?");
    expect(get).toHaveBeenCalledWith("w-2");
  });

  it("wraps work in a transaction and returns its result", () => {
    const { db, transactionWrapper } = createMockDb();
    const work = vi.fn(() => "done");

    const result = runInTransaction(db as never, work);

    expect(transactionWrapper).toHaveBeenCalledWith(work);
    expect(work).toHaveBeenCalled();
    expect(result).toBe("done");
  });
});
