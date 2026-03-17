import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppException } from "@electron/core/appException";
import { PROJECTS_CREATE_PROGRESS_CHANNEL } from "@electron/ipc/contracts/progress.event.contracts";

const {
  loggerInfoMock,
  loggerWarnMock,
  mkdirSyncMock,
  rmSyncMock,
  existsSyncMock,
  statSyncMock,
  getRuntimeDbPathMock,
  getCorpusBinariesDirMock,
  getUdpipeModelPathMock,
  createRunnerMock,
  runInTransactionMock,
  createAppDatabaseMock,
  insertProjectMock,
  insertCorpusMock,
  insertCorpusFilePathMock,
  randomUUIDMock,
  registerCreateProjectOperationMock,
  removeCreateProjectOperationMock,
} = vi.hoisted(() => ({
  loggerInfoMock: vi.fn(),
  loggerWarnMock: vi.fn(),
  mkdirSyncMock: vi.fn(),
  rmSyncMock: vi.fn(),
  existsSyncMock: vi.fn(),
  statSyncMock: vi.fn(),
  getRuntimeDbPathMock: vi.fn(),
  getCorpusBinariesDirMock: vi.fn(),
  getUdpipeModelPathMock: vi.fn(),
  createRunnerMock: vi.fn(),
  runInTransactionMock: vi.fn(),
  createAppDatabaseMock: vi.fn(),
  insertProjectMock: vi.fn(),
  insertCorpusMock: vi.fn(),
  insertCorpusFilePathMock: vi.fn(),
  randomUUIDMock: vi.fn(),
  registerCreateProjectOperationMock: vi.fn(),
  removeCreateProjectOperationMock: vi.fn(),
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    info: loggerInfoMock,
    warn: loggerWarnMock,
    error: vi.fn(),
  },
}));

vi.mock("node:fs", () => ({
  default: {
    mkdirSync: mkdirSyncMock,
    rmSync: rmSyncMock,
    existsSync: existsSyncMock,
    statSync: statSyncMock,
  },
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getRuntimeDbPath: getRuntimeDbPathMock,
  getCorpusBinariesDir: getCorpusBinariesDirMock,
  getUdpipeModelPath: getUdpipeModelPathMock,
}));

vi.mock("@electron/services/nativeProcessFactory", () => ({
  default: {
    create: createRunnerMock,
  },
}));

vi.mock("@electron/db/sqlite", () => ({
  runInTransaction: runInTransactionMock,
}));

vi.mock("@electron/db/appDatabase", () => ({
  createAppDatabase: createAppDatabaseMock,
}));

vi.mock("@electron/db/repositories/projectRepositories", () => ({
  insertProject: insertProjectMock,
  insertCorpus: insertCorpusMock,
  insertCorpusFilePath: insertCorpusFilePathMock,
}));

vi.mock("node:crypto", () => ({
  randomUUID: randomUUIDMock,
  default: {
    randomUUID: randomUUIDMock,
  },
}));

vi.mock("@electron/services/projectServiceRegistry", () => ({
  projectServiceRegistry: {
    registerCreateProjectOperation: registerCreateProjectOperationMock,
    removeCreateProjectOperation: removeCreateProjectOperationMock,
  },
}));

import { createProject } from "../projects/createProject";

describe("createProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T10:00:00.000Z"));

    existsSyncMock.mockImplementation((target: string) => {
      if (target === "/input/corpus" || target === "/rules/semantics.tsv") {
        return true;
      }
      return false;
    });
    statSyncMock.mockImplementation((target: string) => ({
      isDirectory: () => target === "/input/corpus",
      isFile: () => target === "/rules/semantics.tsv",
    }));
    getCorpusBinariesDirMock.mockReturnValue("/tmp/binaries/corpus-a");
    getUdpipeModelPathMock.mockReturnValue("/tmp/models/model.udpipe");
    getRuntimeDbPathMock.mockReturnValue("/tmp/runtime.db");
    randomUUIDMock
      .mockReturnValueOnce("project-uuid")
      .mockReturnValueOnce("corpus-uuid")
      .mockReturnValueOnce("binary-path-uuid");
    runInTransactionMock.mockImplementation((_db: unknown, work: () => void) => work());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("validates, runs the native build, persists metadata, and returns the response DTO", async () => {
    const db = { kind: "db" };
    const closeMock = vi.fn();
    const runner = {
      runProcess: vi.fn().mockResolvedValue({
        stdout: "",
        stderr: "",
        exitCode: 0,
        messages: [],
        result: { outputDir: "/tmp/binaries/corpus-a" },
      }),
      cancelProcess: vi.fn(),
    };
    let capturedNativeParams: { onProgress?: (message: { message: string; percent?: number }) => void } | undefined;

    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
    createRunnerMock.mockImplementation((params: unknown) => {
      capturedNativeParams = params as typeof capturedNativeParams;
      return runner;
    });

    const sendEventMock = vi.fn();
    const result = await createProject(
      {
        requestId: "req-1",
        projectName: " Project A ",
        corpusName: " Corpus A ",
        folderPath: " /input/corpus ",
        semanticsRulesPath: " /rules/semantics.tsv ",
      },
      {
        correlationId: "cid-1",
        sendEvent: sendEventMock,
      }
    );

    capturedNativeParams?.onProgress?.({
      message: "Halfway there",
      percent: 50,
    });

    expect(mkdirSyncMock).toHaveBeenCalledWith("/tmp/binaries/corpus-a", {
      recursive: true,
    });
    expect(createRunnerMock).toHaveBeenCalledWith({
      executable: "corpus_build_pipeline",
      expectJsonLines: true,
      onProgress: expect.any(Function),
    });
    expect(registerCreateProjectOperationMock).toHaveBeenCalledWith({
      requestId: "req-1",
      outputDir: "/tmp/binaries/corpus-a",
      cancel: expect.any(Function),
    });
    expect(runner.runProcess).toHaveBeenCalledWith(
      JSON.stringify({
        command: "buildCorpus",
        modelPath: "/tmp/models/model.udpipe",
        inputPath: "/input/corpus",
        outputDir: "/tmp/binaries/corpus-a",
        semanticsRulesPath: "/rules/semantics.tsv",
        postingFormat: "raw",
        emitNgramPositions: true,
      })
    );
    expect(sendEventMock).toHaveBeenCalledWith(PROJECTS_CREATE_PROGRESS_CHANNEL, {
      requestId: "req-1",
      correlationId: "cid-1",
      message: "Halfway there",
      percent: 50,
    });
    expect(loggerInfoMock).toHaveBeenCalledWith("Corpus build progress", {
      correlationId: "cid-1",
      percent: 50,
      message: "Halfway there",
    });
    expect(createAppDatabaseMock).toHaveBeenCalledWith("/tmp/runtime.db");
    expect(runInTransactionMock).toHaveBeenCalledWith(db, expect.any(Function));
    expect(insertProjectMock).toHaveBeenCalledWith(db, {
      uuid: "project-uuid",
      project_name: "Project A",
      created_at: "2026-03-11T10:00:00.000Z",
    });
    expect(insertCorpusMock).toHaveBeenCalledWith(db, {
      uuid: "corpus-uuid",
      project_uuid: "project-uuid",
      corpus_name: "Corpus A",
      created_at: "2026-03-11T10:00:00.000Z",
    });
    expect(insertCorpusFilePathMock).toHaveBeenCalledWith(db, {
      uuid: "binary-path-uuid",
      corpus_uuid: "corpus-uuid",
      binary_files_path: "/tmp/binaries/corpus-a",
      created_at: "2026-03-11T10:00:00.000Z",
    });
    expect(removeCreateProjectOperationMock).toHaveBeenCalledWith("req-1");
    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      projectUuid: "project-uuid",
      corpusUuid: "corpus-uuid",
      binaryFilesPathUuid: "binary-path-uuid",
      binaryFilesPath: "/tmp/binaries/corpus-a",
    });
  });

  it("rejects when project name is empty", async () => {
    await expect(
      createProject(
        {
          requestId: "req-validation-project",
          projectName: "   ",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
        },
        {
          correlationId: "cid-validation-project",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "VALIDATION_MISSING_FIELD",
      message: "Project name cannot be empty",
    });
  });

  it("forwards explicit posting format and n-gram position flags to the native build request", async () => {
    const runner = {
      runProcess: vi.fn().mockResolvedValue({
        stdout: "",
        stderr: "",
        exitCode: 0,
        messages: [],
        result: { outputDir: "/tmp/binaries/corpus-a" },
      }),
      cancelProcess: vi.fn(),
    };
    const closeMock = vi.fn();

    createRunnerMock.mockReturnValue(runner);
    createAppDatabaseMock.mockReturnValue({ db: { kind: "db" }, close: closeMock });

    await createProject(
      {
        requestId: "req-flags",
        projectName: "Project A",
        corpusName: "Corpus A",
        folderPath: "/input/corpus",
        postingFormat: "compressed",
        emitNgramPositions: false,
      },
      {
        correlationId: "cid-flags",
        sendEvent: vi.fn(),
      }
    );

    expect(runner.runProcess).toHaveBeenCalledWith(
      JSON.stringify({
        command: "buildCorpus",
        modelPath: "/tmp/models/model.udpipe",
        inputPath: "/input/corpus",
        outputDir: "/tmp/binaries/corpus-a",
        semanticsRulesPath: "",
        postingFormat: "compressed",
        emitNgramPositions: false,
      })
    );
  });

  it("rejects when corpus name is empty", async () => {
    await expect(
      createProject(
        {
          requestId: "req-validation-corpus",
          projectName: "Project A",
          corpusName: "   ",
          folderPath: "/input/corpus",
        },
        {
          correlationId: "cid-validation-corpus",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "VALIDATION_MISSING_FIELD",
      message: "Corpus name cannot be empty",
    });
  });

  it("rejects when folder path is empty", async () => {
    await expect(
      createProject(
        {
          requestId: "req-validation-folder",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "   ",
        },
        {
          correlationId: "cid-validation-folder",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "VALIDATION_MISSING_FIELD",
      message: "Folder path cannot be empty",
    });
  });

  it("rejects when the corpus folder does not exist", async () => {
    existsSyncMock.mockReturnValue(false);

    await expect(
      createProject(
        {
          requestId: "req-missing-folder",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/missing/folder",
        },
        {
          correlationId: "cid-missing-folder",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "FS_NOT_FOUND",
      message: "A folder full of corpus files must actually exist on the system.",
    });
  });

  it("rejects when the corpus path is not a directory", async () => {
    existsSyncMock.mockImplementation((target: string) => target === "/input/not-a-directory");
    statSyncMock.mockImplementation(() => ({
      isDirectory: () => false,
      isFile: () => false,
    }));

    await expect(
      createProject(
        {
          requestId: "req-invalid-folder-type",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/not-a-directory",
        },
        {
          correlationId: "cid-invalid-folder-type",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "VALIDATION_INVALID_PAYLOAD",
      message: "The path to the folder you provided is not a folder.",
    });
  });

  it("rejects when the semantics rules file path is empty", async () => {
    await expect(
      createProject(
        {
          requestId: "req-empty-rules",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
          semanticsRulesPath: "   ",
        },
        {
          correlationId: "cid-empty-rules",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "VALIDATION_MISSING_FIELD",
      message: "Semantics rules path cannot be empty",
    });
  });

  it("rejects when the semantics rules file does not exist", async () => {
    existsSyncMock.mockImplementation((target: string) => target === "/input/corpus");

    await expect(
      createProject(
        {
          requestId: "req-missing-rules",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
          semanticsRulesPath: "/rules/missing.tsv",
        },
        {
          correlationId: "cid-missing-rules",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "FS_NOT_FOUND",
      message: "Semantic rules file must actually exist.",
    });
  });

  it("rejects when the semantics rules path is not a file", async () => {
    existsSyncMock.mockImplementation(
      (target: string) => target === "/input/corpus" || target === "/rules/not-a-file.tsv"
    );
    statSyncMock.mockImplementation((target: string) => ({
      isDirectory: () => target === "/input/corpus",
      isFile: () => false,
    }));

    await expect(
      createProject(
        {
          requestId: "req-rules-not-file",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
          semanticsRulesPath: "/rules/not-a-file.tsv",
        },
        {
          correlationId: "cid-rules-not-file",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "VALIDATION_INVALID_PAYLOAD",
      message: "The file provided for semantic rules is not a file.",
    });
  });

  it("rejects when the semantics rules file is not a TSV file", async () => {
    existsSyncMock.mockImplementation(
      (target: string) => target === "/input/corpus" || target === "/rules/semantics.json"
    );
    statSyncMock.mockImplementation((target: string) => ({
      isDirectory: () => target === "/input/corpus",
      isFile: () => target === "/rules/semantics.json",
    }));

    await expect(
      createProject(
        {
          requestId: "req-rules-invalid-extension",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
          semanticsRulesPath: "/rules/semantics.json",
        },
        {
          correlationId: "cid-rules-invalid-extension",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "VALIDATION_INVALID_PAYLOAD",
      message: "The file type for semantic rules must be a tsv file",
    });
  });

  it("cleans up generated binaries and skips persistence when the native process fails", async () => {
    const closeMock = vi.fn();
    const runner = {
      runProcess: vi.fn().mockRejectedValue(new AppException("CPP_PROCESS_NON_ZERO_EXIT", "native failed")),
      cancelProcess: vi.fn(),
    };

    createAppDatabaseMock.mockReturnValue({ db: { kind: "db" }, close: closeMock });
    createRunnerMock.mockReturnValue(runner);

    await expect(
      createProject(
        {
          requestId: "req-native-failure",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
        },
        {
          correlationId: "cid-native-failure",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "CPP_PROCESS_NON_ZERO_EXIT",
      message: "native failed",
    });

    expect(rmSyncMock).toHaveBeenCalledWith("/tmp/binaries/corpus-a", {
      recursive: true,
      force: true,
    });
    expect(removeCreateProjectOperationMock).toHaveBeenCalledWith("req-native-failure");
    expect(createAppDatabaseMock).not.toHaveBeenCalled();
    expect(insertProjectMock).not.toHaveBeenCalled();
    expect(closeMock).not.toHaveBeenCalled();
  });

  it("logs a warning instead of masking the native failure when cleanup also fails", async () => {
    const runner = {
      runProcess: vi.fn().mockRejectedValue(new AppException("CPP_PROCESS_CANCELLED", "cancelled")),
      cancelProcess: vi.fn(),
    };

    rmSyncMock.mockImplementation(() => {
      throw new Error("rm failed");
    });
    createRunnerMock.mockReturnValue(runner);

    await expect(
      createProject(
        {
          requestId: "req-native-cleanup-warning",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
        },
        {
          correlationId: "cid-native-cleanup-warning",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "CPP_PROCESS_CANCELLED",
      message: "cancelled",
    });

    expect(loggerWarnMock).toHaveBeenCalledWith(
      "Corpus build cancelled/failed before metadata persistence",
      {
        correlationId: "cid-native-cleanup-warning",
        outputDir: "/tmp/binaries/corpus-a",
      }
    );
  });

  it("cleans up binaries, raises a DB error, and closes the database when persistence fails", async () => {
    const db = { kind: "db" };
    const closeMock = vi.fn();
    const runner = {
      runProcess: vi.fn().mockResolvedValue({
        stdout: "",
        stderr: "",
        exitCode: 0,
        messages: [],
        result: { outputDir: "/tmp/binaries/corpus-a" },
      }),
      cancelProcess: vi.fn(),
    };

    createRunnerMock.mockReturnValue(runner);
    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
    runInTransactionMock.mockImplementation(() => {
      throw new Error("insert failed");
    });

    await expect(
      createProject(
        {
          requestId: "req-db-failure",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
        },
        {
          correlationId: "cid-db-failure",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "DB_QUERY_FAILED",
      message: "Failed to insert corpus metadata into database",
    });

    expect(rmSyncMock).toHaveBeenCalledWith("/tmp/binaries/corpus-a", {
      recursive: true,
      force: true,
    });
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it("logs a warning if DB cleanup fails after a transaction error", async () => {
    const db = { kind: "db" };
    const closeMock = vi.fn();
    const runner = {
      runProcess: vi.fn().mockResolvedValue({
        stdout: "",
        stderr: "",
        exitCode: 0,
        messages: [],
        result: { outputDir: "/tmp/binaries/corpus-a" },
      }),
      cancelProcess: vi.fn(),
    };

    createRunnerMock.mockReturnValue(runner);
    createAppDatabaseMock.mockReturnValue({ db, close: closeMock });
    runInTransactionMock.mockImplementation(() => {
      throw new Error("insert failed");
    });
    rmSyncMock.mockImplementation(() => {
      throw new Error("cleanup failed");
    });

    await expect(
      createProject(
        {
          requestId: "req-db-cleanup-warning",
          projectName: "Project A",
          corpusName: "Corpus A",
          folderPath: "/input/corpus",
        },
        {
          correlationId: "cid-db-cleanup-warning",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      code: "DB_QUERY_FAILED",
    });

    expect(loggerWarnMock).toHaveBeenCalledWith("Corpus binaries failed to be deleted", {
      correlationId: "cid-db-cleanup-warning",
      outputDir: "/tmp/binaries/corpus-a",
    });
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
