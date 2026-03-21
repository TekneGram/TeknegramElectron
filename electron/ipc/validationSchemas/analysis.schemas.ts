import { z } from "zod";
import {
    ANALYSIS_TYPES,
    type GetAnalysisListRequest,
    type CreateAnalysisRequest,
} from "../contracts/analysis.contracts";

export const getAnalysisListSchema: z.ZodType<GetAnalysisListRequest> = z.object({
    activityId: z.uuid(),
});

export const createAnalysisSchema: z.ZodType<CreateAnalysisRequest> = z.object({
    corpusId: z.uuid(),
    activityId: z.uuid(),
    analysisType: z.enum(ANALYSIS_TYPES),
    config: z.string().nullable(),
});
