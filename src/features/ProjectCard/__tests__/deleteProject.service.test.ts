import { beforeEach, describe, expect, it, vi } from "vitest";
import { FrontAppError } from "@/app/errors/FrontAppError";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { submitDeleteProject } from "../services/deleteProject.service";
import type { DeleteProjectRequest, ProjectsPort } from "@/app/ports/projects.ports";

describe("submitDeleteProject", () => {
  const request: DeleteProjectRequest = {
    projectUuid: "11111111-1111-1111-1111-111111111111",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the delete response when the port succeeds", async () => {
    const response = {
      projectUuid: request.projectUuid,
      deletedBinaryFilesPath: "/tmp/corpus-a",
    };

    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn().mockResolvedValue({ ok: true, value: response }),
    };

    await expect(submitDeleteProject(port, request)).resolves.toEqual(response);
  });

  it("shows an error toast and throws FrontAppError on failure", async () => {
    const errorSpy = vi.spyOn(toastifyNotifier, "error").mockImplementation(() => {});
    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "processing",
          userMessage: "Delete failed",
          debugId: "cid-delete",
        },
      }),
    };

    await expect(submitDeleteProject(port, request)).rejects.toBeInstanceOf(FrontAppError);
    expect(errorSpy).toHaveBeenCalledWith("Delete failed", { id: "delete-project-failed" });
  });
});
