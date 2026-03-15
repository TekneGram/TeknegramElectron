import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  handleMock,
  randomUUIDMock,
  loggerErrorMock,
  listProjectsMock,
  createProjectMock,
  cancelCreateProjectMock,
  deleteProjectMock,
  updateProjectNameMock,
} = vi.hoisted(() => ({
  handleMock: vi.fn(),
  randomUUIDMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  listProjectsMock: vi.fn(),
  createProjectMock: vi.fn(),
  cancelCreateProjectMock: vi.fn(),
  deleteProjectMock: vi.fn(),
  updateProjectNameMock: vi.fn(),
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

vi.mock("@electron/services/projects/listProjects", () => ({
  listProjects: listProjectsMock,
}));

vi.mock("@electron/services/projects/createProject", () => ({
  createProject: createProjectMock,
}));

vi.mock("@electron/services/projects/cancelCreateProject", () => ({
  cancelCreateProject: cancelCreateProjectMock,
}));

vi.mock("@electron/services/projects/deleteProject", () => ({
  deleteProject: deleteProjectMock,
}));

vi.mock("@electron/services/projects/updateProjectName", () => ({
  updateProjectName: updateProjectNameMock,
}));

import { RegisterProjectHandlers } from "../registerHandlers/register.projects";

describe("RegisterProjectHandlers", () => {
  beforeEach(() => {
    handleMock.mockReset();
    randomUUIDMock.mockReset();
    loggerErrorMock.mockReset();
    listProjectsMock.mockReset();
    createProjectMock.mockReset();
    cancelCreateProjectMock.mockReset();
    deleteProjectMock.mockReset();
    updateProjectNameMock.mockReset();
    randomUUIDMock.mockReturnValue("cid-projects-123");
  });

  function getHandler(channel: string) {
    return handleMock.mock.calls.find((call) => call[0] === channel)?.[1];
  }

  it("registers project channels and delegates projects:list with context", async () => {
    const expectedProjects = [{ uuid: "project-1", name: "Alpha" }];
    listProjectsMock.mockResolvedValue(expectedProjects);

    RegisterProjectHandlers();

    expect(handleMock).toHaveBeenCalledTimes(5);
    expect(handleMock.mock.calls.map((call) => call[0])).toEqual([
      "projects:list",
      "projects:create",
      "projects:create:cancel",
      "projects:delete",
      "projects:update-name",
    ]);

    const listHandler = getHandler("projects:list");
    const result = await listHandler({ sender: { send: vi.fn() } }, null);

    expect(listProjectsMock).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: "cid-projects-123", sendEvent: expect.any(Function) })
    );
    expect(result).toEqual({ ok: true, data: expectedProjects });
  });

  it("validates create payloads before delegating to the service", async () => {
    const rawArgs = {
      requestId: "req-1",
      projectName: "Alpha",
      corpusName: "Corpus",
      folderPath: "/tmp/project",
      semanticsRulesPath: "/tmp/rules.txt",
    };
    const serviceResult = {
      projectUuid: "project-uuid",
      corpusUuid: "corpus-uuid",
      binaryFilesPathUuid: "binary-uuid",
      binaryFilesPath: "/tmp/project/bin",
    };
    createProjectMock.mockResolvedValue(serviceResult);

    RegisterProjectHandlers();

    const createHandler = getHandler("projects:create");
    const result = await createHandler({ sender: { send: vi.fn() } }, rawArgs);

    expect(createProjectMock).toHaveBeenCalledWith(
      rawArgs,
      expect.objectContaining({ correlationId: "cid-projects-123", sendEvent: expect.any(Function) })
    );
    expect(result).toEqual({ ok: true, data: serviceResult });
  });

  it("returns a validation failure result for invalid create payloads", async () => {
    RegisterProjectHandlers();

    const createHandler = getHandler("projects:create");
    const result = await createHandler({ sender: { send: vi.fn() } }, {
      requestId: "",
      projectName: "Alpha",
      corpusName: "Corpus",
      folderPath: "/tmp/project",
    });

    expect(createProjectMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_INVALID_PAYLOAD");
      expect(result.error.message).toBe("Invalid request payload");
      expect(result.error.correlationId).toBe("cid-projects-123");
      expect(result.error.details).toContain("requestId: Too small");
    }
    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: projects:create", {
      correlationId: "cid-projects-123",
      error: expect.objectContaining({
        code: "VALIDATION_INVALID_PAYLOAD",
        correlationId: "cid-projects-123",
      }),
    });
  });

  it("validates cancel payloads before delegating to the service", async () => {
    const rawArgs = { requestId: "req-cancel-1" };
    const serviceResult = { requestId: "req-cancel-1", message: "Cancelled" };
    cancelCreateProjectMock.mockResolvedValue(serviceResult);

    RegisterProjectHandlers();

    const cancelHandler = getHandler("projects:create:cancel");
    const result = await cancelHandler({ sender: { send: vi.fn() } }, rawArgs);

    expect(cancelCreateProjectMock).toHaveBeenCalledWith(
      rawArgs,
      expect.objectContaining({ correlationId: "cid-projects-123", sendEvent: expect.any(Function) })
    );
    expect(result).toEqual({ ok: true, data: serviceResult });
  });

  it("returns a validation failure result for invalid cancel payloads", async () => {
    RegisterProjectHandlers();

    const cancelHandler = getHandler("projects:create:cancel");
    const result = await cancelHandler({ sender: { send: vi.fn() } }, { requestId: "" });

    expect(cancelCreateProjectMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_INVALID_PAYLOAD");
      expect(result.error.correlationId).toBe("cid-projects-123");
      expect(result.error.details).toContain("requestId: Too small");
    }
    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: projects:create:cancel", {
      correlationId: "cid-projects-123",
      error: expect.objectContaining({
        code: "VALIDATION_INVALID_PAYLOAD",
        correlationId: "cid-projects-123",
      }),
    });
  });

  it("validates delete payloads before delegating to the service", async () => {
    const rawArgs = { projectUuid: "11111111-1111-4111-8111-111111111111" };
    const serviceResult = {
      projectUuid: rawArgs.projectUuid,
      deletedBinaryFilesPath: "/tmp/corpus-a",
    };
    deleteProjectMock.mockResolvedValue(serviceResult);

    RegisterProjectHandlers();

    const deleteHandler = getHandler("projects:delete");
    const result = await deleteHandler({ sender: { send: vi.fn() } }, rawArgs);

    expect(deleteProjectMock).toHaveBeenCalledWith(
      rawArgs,
      expect.objectContaining({ correlationId: "cid-projects-123", sendEvent: expect.any(Function) })
    );
    expect(result).toEqual({ ok: true, data: serviceResult });
  });

  it("returns a validation failure result for invalid delete payloads", async () => {
    RegisterProjectHandlers();

    const deleteHandler = getHandler("projects:delete");
    const result = await deleteHandler({ sender: { send: vi.fn() } }, { projectUuid: "bad-uuid" });

    expect(deleteProjectMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_INVALID_PAYLOAD");
      expect(result.error.correlationId).toBe("cid-projects-123");
      expect(result.error.details).toContain("projectUuid: Invalid UUID");
    }
    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: projects:delete", {
      correlationId: "cid-projects-123",
      error: expect.objectContaining({
        code: "VALIDATION_INVALID_PAYLOAD",
        correlationId: "cid-projects-123",
      }),
    });
  });

  it("validates update-name payloads before delegating to the service", async () => {
    const rawArgs = {
      projectUuid: "11111111-1111-4111-8111-111111111111",
      projectName: "Updated BAWE",
    };
    const serviceResult = rawArgs;
    updateProjectNameMock.mockResolvedValue(serviceResult);

    RegisterProjectHandlers();

    const updateHandler = getHandler("projects:update-name");
    const result = await updateHandler({ sender: { send: vi.fn() } }, rawArgs);

    expect(updateProjectNameMock).toHaveBeenCalledWith(
      rawArgs,
      expect.objectContaining({ correlationId: "cid-projects-123", sendEvent: expect.any(Function) })
    );
    expect(result).toEqual({ ok: true, data: serviceResult });
  });

  it("returns a validation failure result for invalid update-name payloads", async () => {
    RegisterProjectHandlers();

    const updateHandler = getHandler("projects:update-name");
    const result = await updateHandler({ sender: { send: vi.fn() } }, {
      projectUuid: "bad-uuid",
      projectName: "",
    });

    expect(updateProjectNameMock).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_INVALID_PAYLOAD");
      expect(result.error.correlationId).toBe("cid-projects-123");
      expect(result.error.details).toContain("projectUuid: Invalid UUID");
    }
    expect(loggerErrorMock).toHaveBeenCalledWith("IPC failed: projects:update-name", {
      correlationId: "cid-projects-123",
      error: expect.objectContaining({
        code: "VALIDATION_INVALID_PAYLOAD",
        correlationId: "cid-projects-123",
      }),
    });
  });
});
