import type { AnalysisPorts, CreateAnalysisRequest } from "@/app/ports/analysis.ports";
import { FrontAppError } from "@/app/errors/FrontAppError";
import { toastifyNotifier } from "@/app/adapters/notifications";

import { BubbleBlower } from "../types/bubble";
import { mapBubbleLayerTypeToAnalysisType, mapAnalysisResponseToBubbleRecord, mapAnalysisDataResponseToBubbleLayerData } from "../mappers/bubbleWrap.mappers";

import type { FullBubble } from "../types/bubble";

export async function blowBubble(
    port: AnalysisPorts,
    input: BubbleBlower,
): Promise<FullBubble> {
    const request: CreateAnalysisRequest = {
        corpusId: input.parentContextId,
        activityId: input.activityId,
        analysisType: mapBubbleLayerTypeToAnalysisType(input.bubbleLayerType),
        config: input.config ?? null,
    };

    // TODO - we must implement a registry of some sort otherwise *all*
    // requests will be createMetadataInspectionAnalysis
    if (input.bubbleLayerType === "corpusMetadata") {

    }

    const res = await port.createMetadataInspectionAnalysis(request);

    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "bubble-blower-failed" });
        throw new FrontAppError(res.error);
    }

    const bubbleRecord = mapAnalysisResponseToBubbleRecord(res.value.analysis);
    const bubbleLayerData = mapAnalysisDataResponseToBubbleLayerData(res.value.analysisData);

    return ({
        bubbleRecord,
        bubbleLayerData
    });
}