import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  loggerInfoMock,
  createAppDatabaseMock,
  getRuntimeDbPathMock,
  findProjectRowByUuidMock,
  updateProjectNameRowMock,
} = vi.hoisted(() => ({
  loggerInfoMock: vi.fn(),
  createAppDatabaseMock: vi.fn(),
  getRuntimeDbPathMock: vi.fn(),
  findProjectRowByUuidMock: vi.fn(),
  updateProjectNameRowMock: vi.fn(),
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    info: loggerInfoMock,
  },
}));

vi.mock("@electron/db/appDatabase", () => ({
  createAppDatabase: createAppDatabaseMock,
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getRuntimeDbPath: getRuntimeDbPathMock,
}));

vi.mock("@electron/db/repositories/projectRepositories", () => ({
  findProjectRowByUuid: findProjectRowByUuidMock,
  updateProjectNameRow: updateProjectNameRowMock,
}));

import { updateProjectName } from "../projects/updateProjectName";

describe("updateProjectName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRuntimeDbPathMock.mockReturnValue("/tmp/runtime.db");
  });

  it("updates the project name, logs, and closes the database", async () => {
    const closeMock = vi.fn();
    const db = { tx: "db" };
    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
    findProjectRowByUuidMock.mockReturnValue({
      uuid: "11111111-1111-1111-1111-111111111111",
      project_name: "BAWE",
      created_at: "2026-03-11T00:00:00.000Z",
    });

    const result = await updateProjectName(
      {
        projectUuid: "11111111-1111-1111-1111-111111111111",
        projectName: "  Updated BAWE  ",
      },
      {
        correlationId: "cid-update-name",
        sendEvent: vi.fn(),
      }
    );

    expect(createAppDatabaseMock).toHaveBeenCalledWith("/tmp/runtime.db");
    expect(findProjectRowByUuidMock).toHaveBeenCalledWith(db, "11111111-1111-1111-1111-111111111111");
    expect(updateProjectNameRowMock).toHaveBeenCalledWith(
      db,
      "11111111-1111-1111-1111-111111111111",
      "Updated BAWE"
    );
    expect(result).toEqual({
      projectUuid: "11111111-1111-1111-1111-111111111111",
      projectName: "Updated BAWE",
    });
    expect(loggerInfoMock).toHaveBeenNthCalledWith(1, "Starting updateProjectName process", {
      correlationId: "cid-update-name",
      projectUuid: "11111111-1111-1111-1111-111111111111",
    });
    expect(loggerInfoMock).toHaveBeenNthCalledWith(2, "Project name updated", {
      correlationId: "cid-update-name",
      projectUuid: "11111111-1111-1111-1111-111111111111",
      projectName: "Updated BAWE",
    });
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("raises RESOURCE_NOT_FOUND when the project is missing", async () => {
    const closeMock = vi.fn();
    createAppDatabaseMock.mockReturnValue({ db: {}, close: closeMock });
    findProjectRowByUuidMock.mockReturnValue(undefined);

    await expect(
      updateProjectName(
        {
          projectUuid: "11111111-1111-1111-1111-111111111111",
          projectName: "Updated BAWE",
        },
        {
          correlationId: "cid-update-name",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "RESOURCE_NOT_FOUND",
      message: "Project could not be found.",
    });

    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
