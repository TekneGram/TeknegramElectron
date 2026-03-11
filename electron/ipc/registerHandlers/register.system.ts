import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";

import { pickCorpusFolderSchema, pickSemanticsRulesFileSchema } from "../validationSchemas/system.schemas";
import type { PickCorpusFolderRequest, PickCorpusFolderResponse } from "../contracts/system.contracts";
import { pickCorpusFolder } from "@electron/services/system/pickCorpusFolder";
import type { PickSemanticsRulesFileRequest, PickSemanticsRulesFileResponse } from "../contracts/system.contracts";
import { pickSemanticsRulesFile } from "@electron/services/system/pickSemanticsRulesFile";
import { systemDialogsAdapter } from "@electron/infrastructure/adapters/systemDialogs.adapter";

export function RegisterSystemHandlers(): void {
    safeHandle<PickCorpusFolderRequest, PickCorpusFolderResponse>(
        "system:pick-corpus-folder",
        async (_event, rawArgs, _ctx) => {
            void _ctx;
            const args = validateOrThrow(pickCorpusFolderSchema, rawArgs);
            return pickCorpusFolder(args, systemDialogsAdapter);
        }
    );

    safeHandle<PickSemanticsRulesFileRequest, PickSemanticsRulesFileResponse>(
        "system:pick-semantics-rules-file",
        async (_event, rawArgs, _ctx) => {
            void _ctx;
            const args = validateOrThrow(pickSemanticsRulesFileSchema, rawArgs);
            return pickSemanticsRulesFile(args, systemDialogsAdapter);
        }
    );
}