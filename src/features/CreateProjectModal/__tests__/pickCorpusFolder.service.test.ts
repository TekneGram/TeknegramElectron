import { beforeEach, describe, expect, it, vi } from "vitest";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { pickCorpusFolder } from "../services/pickCorpusFolder.service";
import type { SystemPort } from "@/app/ports/system.ports";

describe("pickCorpusFolder", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the selected folder path when the port succeeds", async () => {
    const port: SystemPort = {
      pickCorpusFolder: vi.fn().mockResolvedValue({
        ok: true,
        value: { folderPath: "/tmp/corpus" },
      }),
      pickSemanticsRulesFile: vi.fn(),
    };

    await expect(pickCorpusFolder(port)).resolves.toEqual({ folderPath: "/tmp/corpus" });
  });

  it("shows an error toast and throws when the port fails", async () => {
    const errorSpy = vi.spyOn(toastifyNotifier, "error").mockImplementation(() => {});
    const port: SystemPort = {
      pickCorpusFolder: vi.fn().mockResolvedValue({
        ok: false,
        error: {
          kind: "infrastructure",
          userMessage: "Folder picker unavailable",
          debugId: "cid-1",
        },
      }),
      pickSemanticsRulesFile: vi.fn(),
    };

    await expect(pickCorpusFolder(port)).rejects.toThrow("Folder picker unavailable");
    expect(errorSpy).toHaveBeenCalledWith("Folder picker unavailable", { id: "pick-corpus-folder-failed" });
  });
});
