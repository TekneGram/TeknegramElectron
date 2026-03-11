import { beforeEach, describe, expect, it, vi } from "vitest";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { pickSemanticsRulesFile } from "../services/pickSemanticsRulesFile.service";
import type { SystemPort } from "@/app/ports/system.ports";

describe("pickSemanticsRulesFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the selected semantics rules file path when the port succeeds", async () => {
    const port: SystemPort = {
      pickCorpusFolder: vi.fn(),
      pickSemanticsRulesFile: vi.fn().mockResolvedValue({
        ok: true,
        value: { filePath: "/tmp/rules.tsv" },
      }),
    };

    await expect(pickSemanticsRulesFile(port)).resolves.toEqual({ filePath: "/tmp/rules.tsv" });
  });

  it("shows an error toast and throws when the port fails", async () => {
    const errorSpy = vi.spyOn(toastifyNotifier, "error").mockImplementation(() => {});
    const port: SystemPort = {
      pickCorpusFolder: vi.fn(),
      pickSemanticsRulesFile: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "infrastructure",
          userMessage: "Rules picker unavailable",
          debugId: "cid-1",
        },
      }),
    };

    await expect(pickSemanticsRulesFile(port)).rejects.toThrow("Rules picker unavailable");
    expect(errorSpy).toHaveBeenCalledWith("Rules picker unavailable", { id: "pick-semantics-rules-file-failed" });
  });
});
