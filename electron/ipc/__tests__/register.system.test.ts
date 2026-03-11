import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  handleMock,
  randomUUIDMock,
  loggerErrorMock,
  pickCorpusFolderMock,
  pickSemanticsRulesFileMock,
  systemDialogsAdapterMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  randomUUIDMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  pickCorpusFolderMock: vi.fn(),
  pickSemanticsRulesFileMock: vi.fn(),
  systemDialogsAdapterMock: { pickFolder: vi.fn(), pickFile: vi.fn() },
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: handleMock,
  },
}));

vi.mock("node:crypto", () => ({
  randomUUID: randomUUIDMock,
  default: {
    randomUUID: randomUUIDMock,
  },
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    error: loggerErrorMock,
  },
}));

vi.mock("@electron/services/system/pickCorpusFolder", () => ({
  pickCorpusFolder: pickCorpusFolderMock,
}));

vi.mock("@electron/services/system/pickSemanticsRulesFile", () => ({
  pickSemanticsRulesFile: pickSemanticsRulesFileMock,
}));

vi.mock("@electron/infrastructure/adapters/systemDialogs.adapter", () => ({
  systemDialogsAdapter: systemDialogsAdapterMock,
}));

import { RegisterSystemHandlers } from "../registerHandlers/register.system";

describe("RegisterSystemHandlers", () => {
  beforeEach(() => {
    handleMock.mockReset();
    randomUUIDMock.mockReset();
    loggerErrorMock.mockReset();
    pickCorpusFolderMock.mockReset();
    pickSemanticsRulesFileMock.mockReset();
    systemDialogsAdapterMock.pickFolder.mockReset();
    systemDialogsAdapterMock.pickFile.mockReset();
    randomUUIDMock.mockReturnValue("cid-system-123");
  });

  it("registers system channels and delegates null payloads to services", async () => {
    pickCorpusFolderMock.mockResolvedValue({ folderPath: "/tmp/corpus" });
    pickSemanticsRulesFileMock.mockResolvedValue({ filePath: "/tmp/rules.txt" });

    RegisterSystemHandlers();

    expect(handleMock).toHaveBeenCalledTimes(2);
    expect(handleMock.mock.calls.map((call) => call[0])).toEqual([
      "system:pick-corpus-folder",
      "system:pick-semantics-rules-file",
    ]);

    const pickCorpusHandler = handleMock.mock.calls[0]?.[1];
    const pickSemanticsHandler = handleMock.mock.calls[1]?.[1];

    await expect(pickCorpusHandler({ sender: { send: vi.fn() } }, null)).resolves.toEqual({
      ok: true,
      data: { folderPath: "/tmp/corpus" },
    });
    await expect(pickSemanticsHandler({ sender: { send: vi.fn() } }, null)).resolves.toEqual({
      ok: true,
      data: { filePath: "/tmp/rules.txt" },
    });

    expect(pickCorpusFolderMock).toHaveBeenCalledWith(null, systemDialogsAdapterMock);
    expect(pickSemanticsRulesFileMock).toHaveBeenCalledWith(null, systemDialogsAdapterMock);
  });

  it("returns validation failure results for non-null corpus-folder payloads", async () => {
    RegisterSystemHandlers();

    const pickCorpusHandler = handleMock.mock.calls[0]?.[1];
    const result = await pickCorpusHandler({ sender: { send: vi.fn() } }, { unexpected: true });

    expect(pickCorpusFolderMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_INVALID_PAYLOAD");
      expect(result.error.message).toBe("Invalid request payload");
      expect(result.error.correlationId).toBe("cid-system-123");
    }
    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: system:pick-corpus-folder", {
      correlationId: "cid-system-123",
      error: expect.objectContaining({
        code: "VALIDATION_INVALID_PAYLOAD",
        correlationId: "cid-system-123",
      }),
    });
  });

  it("returns validation failure results for non-null semantics payloads", async () => {
    RegisterSystemHandlers();

    const pickSemanticsHandler = handleMock.mock.calls[1]?.[1];
    const result = await pickSemanticsHandler({ sender: { send: vi.fn() } }, "invalid");

    expect(pickSemanticsRulesFileMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_INVALID_PAYLOAD");
      expect(result.error.message).toBe("Invalid request payload");
      expect(result.error.correlationId).toBe("cid-system-123");
    }
    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: system:pick-semantics-rules-file", {
      correlationId: "cid-system-123",
      error: expect.objectContaining({
        code: "VALIDATION_INVALID_PAYLOAD",
        correlationId: "cid-system-123",
      }),
    });
  });
});
