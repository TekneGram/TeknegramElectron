import type {
    AnalysisListResponse,
    AnalysisPorts,
    CreateAnalysisRequest,
    GetAnalysisListRequest,
    FullAnalysisResponse

} from "@/app/ports/analysis.ports";
import { invokeRequest } from "./invokeRequest";

export const analysisAdapter: AnalysisPorts = {
    async getAnalysisList(request: GetAnalysisListRequest) {
        return invokeRequest<GetAnalysisListRequest, AnalysisListResponse>("analysis:get:list", request);
    },

    async createMetadataInspectionAnalysis(request: CreateAnalysisRequest) {
        return invokeRequest<CreateAnalysisRequest, FullAnalysisResponse>("analysis:create", request);
    }
}
