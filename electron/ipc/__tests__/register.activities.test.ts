import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  handleMock,
  randomUUIDMock,
  loggerErrorMock,
  requestActivitiesMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  randomUUIDMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  requestActivitiesMock: vi.fn(),
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

vi.mock("@electron/services/activities/requestActivities", () => ({
  requestActivities: requestActivitiesMock,
}));

import { RegisterActivityHandlers } from "../registerHandlers/register.activities";

describe("RegisterActivityHandlers", () => {
  beforeEach(() => {
    handleMock.mockReset();
    randomUUIDMock.mockReset();
    loggerErrorMock.mockReset();
    requestActivitiesMock.mockReset();
    randomUUIDMock.mockReturnValue("cid-activities-123");
  });

  function getHandler(channel: string) {
    return handleMock.mock.calls.find((call) => call[0] === channel)?.[1];
  }

  it("registers the activities request channel and validates payloads", async () => {
    const rawArgs = {
      projectId: "11111111-1111-4111-8111-111111111111",
      activityType: "lb_activities",
      requestType: "get",
    };
    const serviceResult = {
      corpusId: "corpus-1",
      projectId: rawArgs.projectId,
      corpusName: "BAWE",
      binaryFilesPath: "/tmp/bawe",
      activities: [],
    };
    requestActivitiesMock.mockResolvedValue(serviceResult);

    RegisterActivityHandlers();

    expect(handleMock).toHaveBeenCalledTimes(1);
    expect(handleMock).toHaveBeenCalledWith("activities:request", expect.any(Function));

    const handler = getHandler("activities:request");
    const result = await handler({ sender: { send: vi.fn() } }, rawArgs);

    expect(requestActivitiesMock).toHaveBeenCalledWith(
      rawArgs,
      expect.objectContaining({ correlationId: "cid-activities-123", sendEvent: expect.any(Function) })
    );
    expect(result).toEqual({ ok: true, data: serviceResult });
  });

  it("returns a validation failure result for invalid payloads", async () => {
    RegisterActivityHandlers();

    const handler = getHandler("activities:request");
    const result = await handler({ sender: { send: vi.fn() } }, {
      projectId: "bad-uuid",
      activityType: "lb_activities",
      requestType: "get",
    });

    expect(requestActivitiesMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_INVALID_PAYLOAD");
      expect(result.error.correlationId).toBe("cid-activities-123");
      expect(result.error.details).toContain("projectId: Invalid UUID");
    }
    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: activities:request", {
      correlationId: "cid-activities-123",
      error: expect.objectContaining({
        code: "VALIDATION_INVALID_PAYLOAD",
        correlationId: "cid-activities-123",
      }),
    });
  });
});
