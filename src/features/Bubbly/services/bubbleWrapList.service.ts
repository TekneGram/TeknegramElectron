import type { AnalysisListResponse, AnalysisPorts, GetAnalysisListRequest } from "@/app/ports/analysis.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";

export async function fetchBubbleWrapList(port: AnalysisPorts, analysisRequest: GetAnalysisListRequest): Promise<AnalysisListResponse> {
    const res: AppResult<AnalysisListResponse> = await port.getAnalysisList(analysisRequest);
    if(!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "activities-create-failed" });
        throw new FrontAppError(res.error);
    }
    return res.value;
}