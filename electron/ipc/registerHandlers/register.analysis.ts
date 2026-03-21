import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type { 
    AnalysisCorpusMetadataResponse,
    AnalysisListResponse,
    CreateAnalysisRequest,
    GetAnalysisListRequest
} from '@electron/ipc/contracts/analysis.contracts';
import { createAnalysisMetadataInspection } from "@electron/services/analyses/createAnalysisMetadataInspection";
import { getAnalysisList } from "@electron/services/analyses/getAnalysisList";
import { createAnalysisSchema, getAnalysisListSchema } from "../validationSchemas/analysis.schemas";

export function RegisterAnalysisHandlers(): void {
    safeHandle<GetAnalysisListRequest, AnalysisListResponse>(
        "analysis:get:list",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(getAnalysisListSchema, rawArgs);
            return getAnalysisList(args, ctx);
        }
    )

    safeHandle<CreateAnalysisRequest, AnalysisCorpusMetadataResponse>(
        "analysis:create",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(createAnalysisSchema, rawArgs);
            return createAnalysisMetadataInspection(args, ctx);
        }
    );
}
