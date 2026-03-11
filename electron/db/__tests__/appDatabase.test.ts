import { describe, expect, it, vi } from "vitest";

const { openDatabaseMock, closeDatabaseMock } = vi.hoisted(() => ({
  openDatabaseMock: vi.fn(),
  closeDatabaseMock: vi.fn(),
}));

vi.mock("../sqlite", () => ({
  openDatabase: openDatabaseMock,
  closeDatabase: closeDatabaseMock,
}));

import { createAppDatabase } from "../appDatabase";

describe("createAppDatabase", () => {
  it("opens the database and closes the same handle through the wrapper", () => {
    const db = { name: "mock-db" };
    openDatabaseMock.mockReturnValue(db);

    const database = createAppDatabase("/tmp/app.sqlite");

    expect(openDatabaseMock).toHaveBeenCalledWith("/tmp/app.sqlite");
    expect(database.db).toBe(db);

    database.close();

    expect(closeDatabaseMock).toHaveBeenCalledWith(db);
  });
});
