import type { AnalysisListResponse, AnalysisPorts, GetAnalysisListRequest } from "@/app/ports/analysis.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";

export async function fetchBubbleWrapList(port: AnalysisPorts, analysisRequest: GetAnalysisListRequest): Promise<AnalysisListResponse> {
    const res: AppResult<AnalysisListResponse> = await port.getAnalysisList(analysisRequest);
    if(!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "analysis-list-failed"});
        throw new Error(res.error.userMessage);
    }
    return res.value;
}