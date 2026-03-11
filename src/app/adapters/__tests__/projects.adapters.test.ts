import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeRequestMock } = vi.hoisted(() => ({
  invokeRequestMock: vi.fn(),
}));

vi.mock("../invokeRequest", () => ({
  invokeRequest: invokeRequestMock,
}));

import { projectsAdapter } from "../projects.adapters";

describe("projectsAdapter", () => {
  beforeEach(() => {
    invokeRequestMock.mockReset();
  });

  it("lists projects through the projects:list channel", async () => {
    const result = {
      ok: true,
      value: [{ uuid: "project-1", projectName: "BAWE", createdAt: "2026-03-11T00:00:00.000Z" }],
    };
    invokeRequestMock.mockResolvedValue(result);

    await expect(projectsAdapter.listProjects()).resolves.toBe(result);
    expect(invokeRequestMock).toHaveBeenCalledWith("projects:list", null);
  });

  it("creates a project through the projects:create channel", async () => {
    const request = {
      requestId: "req-1",
      projectName: "BAWE",
      corpusName: "Corpus",
      folderPath: "/tmp/corpus",
      semanticsRulesPath: "/tmp/rules.json",
    };
    const result = { ok: true, value: { projectUuid: "project-1" } };
    invokeRequestMock.mockResolvedValue(result);

    await expect(projectsAdapter.createProject(request)).resolves.toBe(result);
    expect(invokeRequestMock).toHaveBeenCalledWith("projects:create", request);
  });

  it("cancels project creation through the projects:create:cancel channel", async () => {
    const request = { requestId: "req-1" };
    const result = { ok: true, value: { requestId: "req-1", message: "Cancelled" } };
    invokeRequestMock.mockResolvedValue(result);

    await expect(projectsAdapter.cancelCreateProject(request)).resolves.toBe(result);
    expect(invokeRequestMock).toHaveBeenCalledWith("projects:create:cancel", request);
  });
});
