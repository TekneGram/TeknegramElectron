import { beforeEach, describe, expect, it, vi } from "vitest";
import { FrontAppError } from "@/app/errors/FrontAppError";
import type { ProjectsPort, UpdateProjectNameRequest } from "@/app/ports/projects.ports";

const notifierErrorMock = vi.hoisted(() => vi.fn());

vi.mock("@/app/adapters/notifications", () => ({
  toastifyNotifier: {
    error: notifierErrorMock,
  },
}));

import { submitUpdateProjectName } from "../services/updateProjectName.service";

describe("submitUpdateProjectName", () => {
  const request: UpdateProjectNameRequest = {
    projectUuid: "11111111-1111-1111-1111-111111111111",
    projectName: "Updated BAWE",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the updated project payload when the port succeeds", async () => {
    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn(),
      updateProjectName: vi.fn().mockResolvedValue({
        ok: true,
        value: request,
      }),
      getCorpusMetadata: vi.fn(),
    };

    await expect(submitUpdateProjectName(port, request)).resolves.toEqual(request);
    expect(port.updateProjectName).toHaveBeenCalledWith(request);
    expect(notifierErrorMock).not.toHaveBeenCalled();
  });

  it("notifies and throws a FrontAppError when the port fails", async () => {
    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn(),
      updateProjectName: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "validation",
          userMessage: "Name is required",
        },
      }),
      getCorpusMetadata: vi.fn(),
    };

    await expect(submitUpdateProjectName(port, request)).rejects.toBeInstanceOf(FrontAppError);
    expect(notifierErrorMock).toHaveBeenCalledWith("Name is required", { id: "update-project-name-failed" });
  });
});
