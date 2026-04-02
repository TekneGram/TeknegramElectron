import type {
    AnalysisListResponse,
    AnalysisPorts,
    CreateAnalysisRequest,
    GetAnalysisListRequest,
    AnalysisCorpusMetadataResponse

} from "@/app/ports/analysis.ports";
import { invokeRequest } from "./invokeRequest";

export const analysisAdapter: AnalysisPorts = {
    async getAnalysisList(request: GetAnalysisListRequest) {
        return invokeRequest<GetAnalysisListRequest, AnalysisListResponse>("analysis:get:list", request);
    },

    async createMetadataInspectionAnalysis(request: CreateAnalysisRequest) {
        return invokeRequest<CreateAnalysisRequest, AnalysisCorpusMetadataResponse>("analysis:create", request);
    }
}