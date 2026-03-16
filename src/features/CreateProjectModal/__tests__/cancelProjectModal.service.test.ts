import { beforeEach, describe, expect, it, vi } from "vitest";
import { FrontAppError } from "@/app/errors/FrontAppError";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { submitCancelCreateProject } from "../services/cancelProjectModal.service";
import type { ProjectsPort, CancelCreateProjectRequest } from "@/app/ports/projects.ports";

describe("submitCancelCreateProject", () => {
  const request: CancelCreateProjectRequest = {
    requestId: "req-1",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the cancel response when the port succeeds", async () => {
    const response = {
      requestId: "req-1",
      message: "Cancellation requested",
    };

    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn().mockResolvedValue({ ok: true, value: response }),
      deleteProject: vi.fn(),
      updateProjectName: vi.fn(),
      getCorpusMetadata: vi.fn(),
    };

    await expect(submitCancelCreateProject(port, request)).resolves.toEqual(response);
  });

  it("shows an error toast and throws FrontAppError for non-cancel failures", async () => {
    const errorSpy = vi.spyOn(toastifyNotifier, "error").mockImplementation(() => {});
    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "processing",
          userMessage: "Cancel failed",
          debugId: "cid-1",
        },
      }),
      deleteProject: vi.fn(),
      updateProjectName: vi.fn(),
      getCorpusMetadata: vi.fn(),
    };

    await expect(submitCancelCreateProject(port, request)).rejects.toBeInstanceOf(FrontAppError);
    expect(errorSpy).toHaveBeenCalledWith("Cancel failed", { id: "cancel-create-project-failed" });
  });

  it("does not show an error toast for cancelled failures but still throws FrontAppError", async () => {
    const errorSpy = vi.spyOn(toastifyNotifier, "error").mockImplementation(() => {});
    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "cancelled",
          userMessage: "Cancelled",
          debugId: "cid-2",
        },
      }),
      deleteProject: vi.fn(),
      updateProjectName: vi.fn(),
      getCorpusMetadata: vi.fn(),
    };

    await expect(submitCancelCreateProject(port, request)).rejects.toMatchObject({
      name: "FrontAppError",
      kind: "cancelled",
      message: "Cancelled",
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
