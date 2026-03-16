import { beforeEach, describe, expect, it, vi } from "vitest";
import { PROJECTS_CREATE_PROGRESS_CHANNEL } from "../contracts/progress.event.contracts";

const { handleMock, randomUUIDMock, loggerErrorMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
  randomUUIDMock: vi.fn(),
  loggerErrorMock: vi.fn(),
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

import { safeHandle } from "../safeHandle";

describe("safeHandle", () => {
  beforeEach(() => {
    handleMock.mockReset();
    randomUUIDMock.mockReset();
    loggerErrorMock.mockReset();
    randomUUIDMock.mockReturnValue("cid-test-123");
  });

  it("registers a handler and returns successful results with request context", async () => {
    const senderSendMock = vi.fn();
    const event = { sender: { send: senderSendMock } };
    const handler = vi.fn(async (_event, args: { value: number }, ctx) => {
      ctx.sendEvent(PROJECTS_CREATE_PROGRESS_CHANNEL, {
        requestId: "req-1",
        correlationId: ctx.correlationId,
        message: "Working",
        percent: 50,
      });

      return { echoed: args.value, correlationId: ctx.correlationId };
    });

    safeHandle("projects:test", handler);

    expect(handleMock).toHaveBeenCalledTimes(1);
    expect(handleMock).toHaveBeenCalledWith("projects:test", expect.any(Function));

    const registeredHandler = handleMock.mock.calls[0]?.[1];
    const result = await registeredHandler(event, { value: 7 });

    expect(handler).toHaveBeenCalledWith(
      event,
      { value: 7 },
      expect.objectContaining({ correlationId: "cid-test-123", sendEvent: expect.any(Function) })
    );
    expect(senderSendMock).toHaveBeenCalledWith(PROJECTS_CREATE_PROGRESS_CHANNEL, {
      requestId: "req-1",
      correlationId: "cid-test-123",
      message: "Working",
      percent: 50,
    });
    expect(result).toEqual({
      ok: true,
      data: { echoed: 7, correlationId: "cid-test-123" },
    });
    expect(loggerErrorMock).not.toHaveBeenCalled();
  });

  it("normalizes thrown errors and logs channel-scoped metadata", async () => {
    const event = { sender: { send: vi.fn() } };
    const error = new Error("Boom");

    safeHandle("projects:test", async () => {
      throw error;
    });

    const registeredHandler = handleMock.mock.calls[0]?.[1];
    const result = await registeredHandler(event, { value: 1 });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("IPC_HANDLER_FAILED");
      expect(result.error.message).toBe("Boom");
      expect(result.error.correlationId).toBe("cid-test-123");
    }

    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: projects:test", {
      correlationId: "cid-test-123",
      error: expect.objectContaining({
        code: "IPC_HANDLER_FAILED",
        message: "Boom",
        correlationId: "cid-test-123",
      }),
    });
  });
});
