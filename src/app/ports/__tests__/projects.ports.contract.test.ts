import { describe, expectTypeOf, it } from "vitest";
import type { AppResult } from "@/app/types/result";
import type {
  CancelCreateProjectRequest,
  CancelCreateProjectResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  ProjectListItem,
  ProjectsPort,
} from "../projects.ports";

describe("projects port contracts", () => {
  it("accepts valid request and response shapes", () => {
    const projectListItem: ProjectListItem = {
      uuid: "project-1",
      projectName: "Corpus Builder",
      createdAt: "2026-03-11T10:00:00.000Z",
    };

    const createRequest: CreateProjectRequest = {
      requestId: "req-1",
      projectName: "Corpus Builder",
      corpusName: "Main Corpus",
      folderPath: "/tmp/corpus",
      semanticsRulesPath: "/tmp/rules.tsv",
    };

    const createRequestWithoutRules: CreateProjectRequest = {
      requestId: "req-2",
      projectName: "Corpus Builder",
      corpusName: "Main Corpus",
      folderPath: "/tmp/corpus",
    };

    const createResponse: CreateProjectResponse = {
      projectUuid: "project-1",
      corpusUuid: "corpus-1",
      binaryFilesPathUuid: "path-1",
      binaryFilesPath: "/tmp/corpus/bin",
    };

    const cancelRequest: CancelCreateProjectRequest = {
      requestId: "req-1",
    };

    const cancelResponse: CancelCreateProjectResponse = {
      requestId: "req-1",
      message: "Cancelled",
    };

    expectTypeOf(projectListItem).toEqualTypeOf<ProjectListItem>();
    expectTypeOf(createRequest).toEqualTypeOf<CreateProjectRequest>();
    expectTypeOf(createRequestWithoutRules).toEqualTypeOf<CreateProjectRequest>();
    expectTypeOf(createResponse).toEqualTypeOf<CreateProjectResponse>();
    expectTypeOf(cancelRequest).toEqualTypeOf<CancelCreateProjectRequest>();
    expectTypeOf(cancelResponse).toEqualTypeOf<CancelCreateProjectResponse>();
  });

  it("requires all ProjectsPort methods to return AppResult-wrapped promises", async () => {
    const port: ProjectsPort = {
      async listProjects() {
        return {
          ok: true,
          value: [],
        };
      },
      async createProject(request) {
        void request;
        return {
          ok: true,
          value: {
            projectUuid: "project-1",
            corpusUuid: "corpus-1",
            binaryFilesPathUuid: "path-1",
            binaryFilesPath: "/tmp/corpus/bin",
          },
        };
      },
      async cancelCreateProject(request) {
        void request;
        return {
          ok: true,
          value: {
            requestId: "req-1",
            message: "Cancelled",
          },
        };
      },
    };

    const listResult = await port.listProjects();
    const createResult = await port.createProject({
      requestId: "req-1",
      projectName: "Corpus Builder",
      corpusName: "Main Corpus",
      folderPath: "/tmp/corpus",
    });
    const cancelResult = await port.cancelCreateProject({ requestId: "req-1" });

    expectTypeOf(listResult).toEqualTypeOf<AppResult<ProjectListItem[]>>();
    expectTypeOf(createResult).toEqualTypeOf<AppResult<CreateProjectResponse>>();
    expectTypeOf(cancelResult).toEqualTypeOf<AppResult<CancelCreateProjectResponse>>();
  });

  it("rejects invalid project contract shapes", () => {
    // @ts-expect-error missing required folderPath
    const missingFolderPath: CreateProjectRequest = {
      requestId: "req-1",
      projectName: "Corpus Builder",
      corpusName: "Main Corpus",
    };

    // @ts-expect-error missing required cancelCreateProject method
    const incompletePort: ProjectsPort = {
      async listProjects() {
        return {
          ok: true,
          value: [],
        };
      },
      async createProject(request) {
        void request;
        return {
          ok: true,
          value: {
            projectUuid: "project-1",
            corpusUuid: "corpus-1",
            binaryFilesPathUuid: "path-1",
            binaryFilesPath: "/tmp/corpus/bin",
          },
        };
      },
    };

    expectTypeOf(missingFolderPath).toEqualTypeOf<CreateProjectRequest>();
    expectTypeOf(incompletePort).toEqualTypeOf<ProjectsPort>();
  });
});
