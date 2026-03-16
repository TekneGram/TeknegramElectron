import { describe, expectTypeOf, it } from "vitest";
import type { AppResult } from "@/app/types/result";
import type {
  PickCorpusFolderResponse,
  PickSemanticsRulesFileResponse,
  SystemPort,
} from "../system.ports";

describe("system port contracts", () => {
  it("accepts nullable folder and file picker responses", () => {
    const pickedFolder: PickCorpusFolderResponse = {
      folderPath: "/tmp/corpus",
    };

    const cancelledFolderPick: PickCorpusFolderResponse = {
      folderPath: null,
    };

    const pickedRulesFile: PickSemanticsRulesFileResponse = {
      filePath: "/tmp/rules.tsv",
    };

    const cancelledFilePick: PickSemanticsRulesFileResponse = {
      filePath: null,
    };

    expectTypeOf(pickedFolder).toEqualTypeOf<PickCorpusFolderResponse>();
    expectTypeOf(cancelledFolderPick).toEqualTypeOf<PickCorpusFolderResponse>();
    expectTypeOf(pickedRulesFile).toEqualTypeOf<PickSemanticsRulesFileResponse>();
    expectTypeOf(cancelledFilePick).toEqualTypeOf<PickSemanticsRulesFileResponse>();
  });

  it("requires AppResult-wrapped picker methods", async () => {
    const port: SystemPort = {
      async pickCorpusFolder() {
        return {
          ok: true,
          value: { folderPath: "/tmp/corpus" },
        };
      },
      async pickSemanticsRulesFile() {
        return {
          ok: true,
          value: { filePath: "/tmp/rules.tsv" },
        };
      },
    };

    const folderResult = await port.pickCorpusFolder();
    const fileResult = await port.pickSemanticsRulesFile();

    expectTypeOf(folderResult).toEqualTypeOf<AppResult<PickCorpusFolderResponse>>();
    expectTypeOf(fileResult).toEqualTypeOf<AppResult<PickSemanticsRulesFileResponse>>();
  });

  it("rejects invalid picker response shapes", () => {
    const invalidFolderResponse: PickCorpusFolderResponse = {
      // @ts-expect-error folderPath must be string or null
      folderPath: 123,
    };

    const invalidFileResponse: PickSemanticsRulesFileResponse = {
      // @ts-expect-error filePath must be string or null
      filePath: false,
    };

    expectTypeOf(invalidFolderResponse).toEqualTypeOf<PickCorpusFolderResponse>();
    expectTypeOf(invalidFileResponse).toEqualTypeOf<PickSemanticsRulesFileResponse>();
  });
});
