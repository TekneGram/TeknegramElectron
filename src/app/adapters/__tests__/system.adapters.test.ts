import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeRequestMock } = vi.hoisted(() => ({
  invokeRequestMock: vi.fn(),
}));

vi.mock("../invokeRequest", () => ({
  invokeRequest: invokeRequestMock,
}));

import { systemAdapter } from "../system.adapters";

describe("systemAdapter", () => {
  beforeEach(() => {
    invokeRequestMock.mockReset();
  });

  it("calls the corpus folder IPC channel with null payload", async () => {
    const result = { ok: true, value: { folderPath: "/tmp/corpus" } };
    invokeRequestMock.mockResolvedValue(result);

    await expect(systemAdapter.pickCorpusFolder()).resolves.toBe(result);
    expect(invokeRequestMock).toHaveBeenCalledWith("system:pick-corpus-folder", null);
  });

  it("calls the semantics rules file IPC channel with null payload", async () => {
    const result = { ok: true, value: { filePath: "/tmp/rules.json" } };
    invokeRequestMock.mockResolvedValue(result);

    await expect(systemAdapter.pickSemanticsRulesFile()).resolves.toBe(result);
    expect(invokeRequestMock).toHaveBeenCalledWith("system:pick-semantics-rules-file", null);
  });
});
