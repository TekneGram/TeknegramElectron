import { describe, expect, it, vi } from "vitest";
import { pickSemanticsRulesFile } from "../system/pickSemanticsRulesFile";

describe("pickSemanticsRulesFile", () => {
  it("returns the selected file path from the dialogs port", async () => {
    const openSemanticsRulesFileDialog = vi.fn().mockResolvedValue({
      filePath: "/tmp/rules.tsv",
    });

    const result = await pickSemanticsRulesFile(null, {
      openSemanticsRulesFileDialog,
    } as never);

    expect(openSemanticsRulesFileDialog).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      filePath: "/tmp/rules.tsv",
    });
  });

  it("preserves a null file path when the dialog is cancelled", async () => {
    const openSemanticsRulesFileDialog = vi.fn().mockResolvedValue({
      filePath: null,
    });

    const result = await pickSemanticsRulesFile(null, {
      openSemanticsRulesFileDialog,
    } as never);

    expect(result).toEqual({
      filePath: null,
    });
  });
});
