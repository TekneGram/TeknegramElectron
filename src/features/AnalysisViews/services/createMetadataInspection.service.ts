import type { AnalysisPorts, AnalysisCorpusMetadataResponse, CreateAnalysisRequest } from '@/app/ports/analysis.ports';
import { FrontAppError } from '@/app/errors/FrontAppError';
import { toastifyNotifier } from '@/app/adapters/notifications';

export async function createMetadataInspection(
    port: AnalysisPorts,
    request: CreateAnalysisRequest,
): Promise<AnalysisCorpusMetadataResponse> {
    const res = await port.createMetadataInspectionAnalysis(request);

    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "activities-create-failed" });
        throw new FrontAppError(res.error);
    }

    return res.value;
}