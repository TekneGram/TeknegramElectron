import { beforeEach, describe, expect, it, vi } from "vitest";
import { toastifyNotifier } from "@/app/adapters/notifications";
import type { ProjectsPort } from "@/app/ports/projects.ports";
import { listProjects } from "../services/projects.tinyview.service";

describe("listProjects", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the project list when the port succeeds", async () => {
    const projects = [
      {
        uuid: "project-1",
        projectName: "BAWE",
        createdAt: "2026-03-11T00:00:00.000Z",
      },
    ];

    const port: ProjectsPort = {
      listProjects: vi.fn().mockResolvedValue({ ok: true, value: projects }),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn(),
    };

    await expect(listProjects(port)).resolves.toEqual(projects);
  });

  it("shows an error toast and throws when the port fails", async () => {
    const errorSpy = vi.spyOn(toastifyNotifier, "error").mockImplementation(() => {});
    const port: ProjectsPort = {
      listProjects: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "processing",
          userMessage: "Failed to load projects",
          debugId: "cid-1",
        },
      }),
      createProject: vi.fn(),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn(),
    };

    await expect(listProjects(port)).rejects.toThrow("Failed to load projects");
    expect(errorSpy).toHaveBeenCalledWith("Failed to load projects", {
      id: "projects-list-failed",
    });
  });
});
