import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAppDatabaseMock,
  getRuntimeDbPathMock,
  listProjectRowsMock,
  loggerInfoMock,
} = vi.hoisted(() => ({
  createAppDatabaseMock: vi.fn(),
  getRuntimeDbPathMock: vi.fn(),
  listProjectRowsMock: vi.fn(),
  loggerInfoMock: vi.fn(),
}));

vi.mock("@electron/db/appDatabase", () => ({
  createAppDatabase: createAppDatabaseMock,
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getRuntimeDbPath: getRuntimeDbPathMock,
}));

vi.mock("@electron/db/repositories/projectRepositories", () => ({
  listProjectRows: listProjectRowsMock,
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    info: loggerInfoMock,
  },
}));

import { listProjects } from "../projects/listProjects";

describe("listProjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRuntimeDbPathMock.mockReturnValue("/tmp/runtime.db");
  });

  it("maps repository rows to DTOs, logs, and closes the database", async () => {
    const closeMock = vi.fn();
    const db = { tx: "db" };

    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
    listProjectRowsMock.mockReturnValue([
      {
        uuid: "project-1",
        project_name: "Corpus One",
        created_at: "2026-03-11T00:00:00.000Z",
      },
      {
        uuid: "project-2",
        project_name: "Corpus Two",
        created_at: "2026-03-10T00:00:00.000Z",
      },
    ]);

    const result = await listProjects({
      correlationId: "cid-list",
      sendEvent: vi.fn(),
    });

    expect(createAppDatabaseMock).toHaveBeenCalledWith("/tmp/runtime.db");
    expect(listProjectRowsMock).toHaveBeenCalledWith(db);
    expect(result).toEqual([
      {
        uuid: "project-1",
        projectName: "Corpus One",
        createdAt: "2026-03-11T00:00:00.000Z",
      },
      {
        uuid: "project-2",
        projectName: "Corpus Two",
        createdAt: "2026-03-10T00:00:00.000Z",
      },
    ]);
    expect(loggerInfoMock).toHaveBeenNthCalledWith(1, "Listing projects", {
      correlationId: "cid-list",
    });
    expect(loggerInfoMock).toHaveBeenNthCalledWith(2, "Projects listed", {
      correlationId: "cid-list",
      count: 2,
    });
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("closes the database when listing fails", async () => {
    const closeMock = vi.fn();
    const db = { tx: "db" };
    const failure = new Error("sqlite busy");

    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
    listProjectRowsMock.mockImplementation(() => {
      throw failure;
    });

    await expect(
      listProjects({
        correlationId: "cid-list-error",
        sendEvent: vi.fn(),
      })
    ).rejects.toThrow("sqlite busy");

    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledTimes(1);
  });
});
