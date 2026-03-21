import { z } from "zod";
import {
    ANALYSIS_TYPES,
    type CreateAnalysisRequest,
} from "../contracts/analysis.contracts";

export const createAnalysisSchema: z.ZodType<CreateAnalysisRequest> = z.object({
    corpusId: z.string().uuid(),
    activityId: z.string().uuid(),
    analysisType: z.enum(ANALYSIS_TYPES),
    config: z.string().nullable(),
});
