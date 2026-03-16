import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mkdirSyncMock, appendFileSyncMock, getPathMock } = vi.hoisted(() => ({
  mkdirSyncMock: vi.fn(),
  appendFileSyncMock: vi.fn(),
  getPathMock: vi.fn(),
}));

vi.mock("node:fs", () => ({
  default: {
    mkdirSync: mkdirSyncMock,
    appendFileSync: appendFileSyncMock,
  },
}));

vi.mock("electron", () => ({
  app: {
    getPath: getPathMock,
  },
}));

import { logger } from "../logger";

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T12:34:56.000Z"));
    getPathMock.mockReturnValue("/tmp/user-data");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes info log lines to the main log file", () => {
    logger.info("Started service", { correlationId: "cid-1" });

    expect(mkdirSyncMock).toHaveBeenCalledWith("/tmp/user-data/logs", {
      recursive: true,
    });
    expect(appendFileSyncMock).toHaveBeenCalledWith(
      "/tmp/user-data/logs/main.log",
      '[2026-03-11T12:34:56.000Z] [INFO] Started service {"correlationId":"cid-1"}\n',
      "utf8"
    );
  });

  it("writes warn and error log lines with the correct levels", () => {
    logger.warn("Warn message");
    logger.error("Error message", { code: "E_FAIL" });

    expect(appendFileSyncMock).toHaveBeenNthCalledWith(
      1,
      "/tmp/user-data/logs/main.log",
      "[2026-03-11T12:34:56.000Z] [WARN] Warn message\n",
      "utf8"
    );
    expect(appendFileSyncMock).toHaveBeenNthCalledWith(
      2,
      "/tmp/user-data/logs/main.log",
      '[2026-03-11T12:34:56.000Z] [ERROR] Error message {"code":"E_FAIL"}\n',
      "utf8"
    );
  });
});
