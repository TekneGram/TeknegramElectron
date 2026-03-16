import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  loggerInfoMock,
  loggerWarnMock,
  loggerErrorMock,
  existsSyncMock,
  mkdirSyncMock,
  rmSyncMock,
  renameSyncMock,
  createAppDatabaseMock,
  getRuntimeDbPathMock,
  getCorpusDeletionStagingDirMock,
  findProjectDeleteTargetRowMock,
  deleteProjectRowMock,
  runInTransactionMock,
} = vi.hoisted(() => ({
  loggerInfoMock: vi.fn(),
  loggerWarnMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  existsSyncMock: vi.fn(),
  mkdirSyncMock: vi.fn(),
  rmSyncMock: vi.fn(),
  renameSyncMock: vi.fn(),
  createAppDatabaseMock: vi.fn(),
  getRuntimeDbPathMock: vi.fn(),
  getCorpusDeletionStagingDirMock: vi.fn(),
  findProjectDeleteTargetRowMock: vi.fn(),
  deleteProjectRowMock: vi.fn(),
  runInTransactionMock: vi.fn(),
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    info: loggerInfoMock,
    warn: loggerWarnMock,
    error: loggerErrorMock,
  },
}));

vi.mock("node:fs", () => ({
  default: {
    existsSync: existsSyncMock,
    mkdirSync: mkdirSyncMock,
    rmSync: rmSyncMock,
    renameSync: renameSyncMock,
  },
}));

vi.mock("@electron/db/appDatabase", () => ({
  createAppDatabase: createAppDatabaseMock,
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getRuntimeDbPath: getRuntimeDbPathMock,
  getCorpusDeletionStagingDir: getCorpusDeletionStagingDirMock,
}));

vi.mock("@electron/db/repositories/projectRepositories", () => ({
  findProjectDeleteTargetRow: findProjectDeleteTargetRowMock,
  deleteProjectRow: deleteProjectRowMock,
}));

vi.mock("@electron/db/sqlite", () => ({
  runInTransaction: runInTransactionMock,
}));

import { deleteProject } from "../projects/deleteProject";

describe("deleteProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRuntimeDbPathMock.mockReturnValue("/tmp/runtime.db");
    getCorpusDeletionStagingDirMock.mockReturnValue("/tmp/generated/pending-delete/project-1");
    existsSyncMock.mockImplementation((target: string) => target === "/tmp/corpus-a");
    runInTransactionMock.mockImplementation((_db: unknown, work: () => void) => work());
  });

  it("stages binaries, deletes metadata, removes staged files, and closes the database", async () => {
    const db = { name: "db" };
    const closeMock = vi.fn();
    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
    findProjectDeleteTargetRowMock.mockReturnValue({
      project_uuid: "11111111-1111-1111-1111-111111111111",
      corpus_uuid: "22222222-2222-2222-2222-222222222222",
      binary_files_path: "/tmp/corpus-a",
    });

    const result = await deleteProject(
      { projectUuid: "11111111-1111-1111-1111-111111111111" },
      { correlationId: "cid-delete", sendEvent: vi.fn() }
    );

    expect(createAppDatabaseMock).toHaveBeenCalledWith("/tmp/runtime.db");
    expect(findProjectDeleteTargetRowMock).toHaveBeenCalledWith(db, "11111111-1111-1111-1111-111111111111");
    expect(mkdirSyncMock).toHaveBeenCalledWith("/tmp/generated/pending-delete", { recursive: true });
    expect(renameSyncMock).toHaveBeenNthCalledWith(1, "/tmp/corpus-a", "/tmp/generated/pending-delete/project-1");
    expect(runInTransactionMock).toHaveBeenCalledWith(db, expect.any(Function));
    expect(deleteProjectRowMock).toHaveBeenCalledWith(db, "11111111-1111-1111-1111-111111111111");
    expect(rmSyncMock).toHaveBeenCalledWith("/tmp/generated/pending-delete/project-1", {
      recursive: true,
      force: true,
    });
    expect(result).toEqual({
      projectUuid: "11111111-1111-1111-1111-111111111111",
      deletedBinaryFilesPath: "/tmp/corpus-a",
    });
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("raises RESOURCE_NOT_FOUND when the project cannot be found", async () => {
    const closeMock = vi.fn();
    createAppDatabaseMock.mockReturnValue({ db: {}, close: closeMock });
    findProjectDeleteTargetRowMock.mockReturnValue(undefined);

    await expect(
      deleteProject(
        { projectUuid: "11111111-1111-1111-1111-111111111111" },
        { correlationId: "cid-missing", sendEvent: vi.fn() }
      )
    ).rejects.toMatchObject({
      code: "RESOURCE_NOT_FOUND",
      message: "Project could not be found.",
    });

    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("restores the staged directory if the database delete fails", async () => {
    const db = { name: "db" };
    createAppDatabaseMock.mockReturnValue({ db, close: vi.fn() });
    findProjectDeleteTargetRowMock.mockReturnValue({
      project_uuid: "11111111-1111-1111-1111-111111111111",
      corpus_uuid: "22222222-2222-2222-2222-222222222222",
      binary_files_path: "/tmp/corpus-a",
    });
    runInTransactionMock.mockImplementation(() => {
      throw new Error("sqlite busy");
    });

    await expect(
      deleteProject(
        { projectUuid: "11111111-1111-1111-1111-111111111111" },
        { correlationId: "cid-db-failure", sendEvent: vi.fn() }
      )
    ).rejects.toMatchObject({
      code: "DB_QUERY_FAILED",
      message: "Failed to delete project metadata from database.",
    });

    expect(renameSyncMock).toHaveBeenNthCalledWith(1, "/tmp/corpus-a", "/tmp/generated/pending-delete/project-1");
    expect(renameSyncMock).toHaveBeenNthCalledWith(2, "/tmp/generated/pending-delete/project-1", "/tmp/corpus-a");
  });
});
