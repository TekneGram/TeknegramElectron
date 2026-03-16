import { describe, expect, it, vi } from "vitest";
import { pickCorpusFolder } from "../system/pickCorpusFolder";

describe("pickCorpusFolder", () => {
  it("returns the selected folder path from the dialogs port", async () => {
    const openCorpusFolderDialog = vi.fn().mockResolvedValue({
      folderPath: "/tmp/corpus-folder",
    });

    const result = await pickCorpusFolder(null, {
      openCorpusFolderDialog,
    } as never);

    expect(openCorpusFolderDialog).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      folderPath: "/tmp/corpus-folder",
    });
  });

  it("preserves a null folder path when the dialog is cancelled", async () => {
    const openCorpusFolderDialog = vi.fn().mockResolvedValue({
      folderPath: null,
    });

    const result = await pickCorpusFolder(null, {
      openCorpusFolderDialog,
    } as never);

    expect(result).toEqual({
      folderPath: null,
    });
  });
});
