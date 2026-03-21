import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type { 
    AnalysisCorpusMetadataResponse,
    CreateAnalysisRequest
} from '@electron/ipc/contracts/analysis.contracts';
import { createAnalysisMetadataInspection } from "@electron/services/analyses/createAnalysisMetadataInspection";
import { createAnalysisSchema } from "../validationSchemas/analysis.schemas";

export function RegisterAnalysisHandlers(): void {
    safeHandle<CreateAnalysisRequest, AnalysisCorpusMetadataResponse>(
        "analysis:create",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(createAnalysisSchema, rawArgs);
            return createAnalysisMetadataInspection(args, ctx);
        }
    );
}
