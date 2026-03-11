import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCreateProjectOperationMock, loggerInfoMock } = vi.hoisted(() => ({
  getCreateProjectOperationMock: vi.fn(),
  loggerInfoMock: vi.fn(),
}));

vi.mock("../projectServiceRegistry", () => ({
  projectServiceRegistry: {
    getCreateProjectOperation: getCreateProjectOperationMock,
  },
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    info: loggerInfoMock,
  },
}));

import { cancelCreateProject } from "../projects/cancelCreateProject";

describe("cancelCreateProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cancels the active create-project operation and returns a typed response", async () => {
    const cancelMock = vi.fn();

    getCreateProjectOperationMock.mockReturnValue({
      requestId: "req-1",
      outputDir: "/tmp/corpus",
      cancel: cancelMock,
    });

    const response = await cancelCreateProject(
      { requestId: "req-1" },
      {
        correlationId: "cid-1",
        sendEvent: vi.fn(),
      }
    );

    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(loggerInfoMock).toHaveBeenCalledWith("Cancel build project requested", {
      correlationId: "cid-1",
      requestId: "req-1",
    });
    expect(response).toEqual({
      requestId: "req-1",
      message: "Project creation cancellation requested.",
    });
  });

  it("throws an AppException when no active operation exists", async () => {
    getCreateProjectOperationMock.mockReturnValue(undefined);

    await expect(
      cancelCreateProject(
        { requestId: "missing-request" },
        {
          correlationId: "cid-missing",
          sendEvent: vi.fn(),
        }
      )
    ).rejects.toMatchObject({
      name: "AppException",
      code: "VALIDATION_INVALID_STATE",
    });

    expect(loggerInfoMock).not.toHaveBeenCalled();
  });
});
