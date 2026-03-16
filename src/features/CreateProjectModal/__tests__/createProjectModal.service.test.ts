import { beforeEach, describe, expect, it, vi } from "vitest";
import { FrontAppError } from "@/app/errors/FrontAppError";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { submitCreateProject } from "../services/createProjectModal.service";
import type { ProjectsPort, CreateProjectRequest } from "@/app/ports/projects.ports";

describe("submitCreateProject", () => {
  const request: CreateProjectRequest = {
    requestId: "req-1",
    projectName: "Project",
    corpusName: "Corpus",
    folderPath: "/tmp/corpus",
    semanticsRulesPath: "/tmp/rules.tsv",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the created project response when the port succeeds", async () => {
    const response = {
      projectUuid: "project-1",
      corpusUuid: "corpus-1",
      binaryFilesPathUuid: "path-1",
      binaryFilesPath: "/tmp/output",
    };

    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn().mockResolvedValue({ ok: true, value: response }),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn(),
      updateProjectName: vi.fn(),
      getCorpusMetadata: vi.fn(),
    };

    await expect(submitCreateProject(port, request)).resolves.toEqual(response);
  });

  it("shows an error toast and throws FrontAppError for non-cancel failures", async () => {
    const errorSpy = vi.spyOn(toastifyNotifier, "error").mockImplementation(() => {});
    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "processing",
          userMessage: "Build failed",
          debugId: "cid-1",
        },
      }),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn(),
      updateProjectName: vi.fn(),
      getCorpusMetadata: vi.fn(),
    };

    await expect(submitCreateProject(port, request)).rejects.toBeInstanceOf(FrontAppError);
    expect(errorSpy).toHaveBeenCalledWith("Build failed", { id: "create-project-failed" });
  });

  it("does not show an error toast for cancelled failures but still throws FrontAppError", async () => {
    const errorSpy = vi.spyOn(toastifyNotifier, "error").mockImplementation(() => {});
    const port: ProjectsPort = {
      listProjects: vi.fn(),
      createProject: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "cancelled",
          userMessage: "Cancelled",
          debugId: "cid-2",
        },
      }),
      cancelCreateProject: vi.fn(),
      deleteProject: vi.fn(),
      updateProjectName: vi.fn(),
      getCorpusMetadata: vi.fn(),
    };

    await expect(submitCreateProject(port, request)).rejects.toMatchObject({
      name: "FrontAppError",
      kind: "cancelled",
      message: "Cancelled",
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
