import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  handleMock,
  randomUUIDMock,
  loggerErrorMock,
  getActivitiesMock,
  createActivityMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  randomUUIDMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  getActivitiesMock: vi.fn(),
  createActivityMock: vi.fn(),
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
  getActivities: getActivitiesMock,
  createActivity: createActivityMock,
}));

import { RegisterActivityHandlers } from "../registerHandlers/register.activities";

describe("RegisterActivityHandlers", () => {
  beforeEach(() => {
    handleMock.mockReset();
    randomUUIDMock.mockReset();
    loggerErrorMock.mockReset();
    getActivitiesMock.mockReset();
    createActivityMock.mockReset();
    randomUUIDMock.mockReturnValue("cid-activities-123");
  });

  function getHandler(channel: string) {
    return handleMock.mock.calls.find((call) => call[0] === channel)?.[1];
  }

  it("registers the activities get channel and validates payloads", async () => {
    const rawArgs = {
      projectId: "11111111-1111-4111-8111-111111111111",
    };
    const serviceResult = {
      corpusId: "corpus-1",
      projectId: rawArgs.projectId,
      corpusName: "BAWE",
      binaryFilesPath: "/tmp/bawe",
      activities: [],
    };
    getActivitiesMock.mockResolvedValue(serviceResult);

    RegisterActivityHandlers();

    expect(handleMock).toHaveBeenCalledWith("activities:get", expect.any(Function));
    expect(handleMock).toHaveBeenCalledWith("activities:create", expect.any(Function));

    const handler = getHandler("activities:get");
    const result = await handler({ sender: { send: vi.fn() } }, rawArgs);

    expect(getActivitiesMock).toHaveBeenCalledWith(
      rawArgs,
      expect.objectContaining({ correlationId: "cid-activities-123", sendEvent: expect.any(Function) })
    );
    expect(result).toEqual({ ok: true, data: serviceResult });
  });

  it("registers the activities create channel and validates payloads", async () => {
    const rawArgs = {
      projectId: "11111111-1111-4111-8111-111111111111",
      activityType: "lb_activities",
    };
    const serviceResult = {
      corpusId: "corpus-1",
      projectId: rawArgs.projectId,
      corpusName: "BAWE",
      binaryFilesPath: "/tmp/bawe",
      activities: [],
    };
    createActivityMock.mockResolvedValue(serviceResult);

    RegisterActivityHandlers();

    const handler = getHandler("activities:create");
    const result = await handler({ sender: { send: vi.fn() } }, rawArgs);

    expect(createActivityMock).toHaveBeenCalledWith(
      rawArgs,
      expect.objectContaining({ correlationId: "cid-activities-123", sendEvent: expect.any(Function) })
    );
    expect(result).toEqual({ ok: true, data: serviceResult });
  });

  it("returns a validation failure result for invalid get payloads", async () => {
    RegisterActivityHandlers();

    const handler = getHandler("activities:get");
    const result = await handler({ sender: { send: vi.fn() } }, {
      projectId: "bad-uuid",
    });

    expect(getActivitiesMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_INVALID_PAYLOAD");
      expect(result.error.correlationId).toBe("cid-activities-123");
      expect(result.error.details).toContain("projectId: Invalid UUID");
    }
    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: activities:get", {
      correlationId: "cid-activities-123",
      error: expect.objectContaining({
        code: "VALIDATION_INVALID_PAYLOAD",
        correlationId: "cid-activities-123",
      }),
    });
  });
});
