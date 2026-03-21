import type { AnalysisResponse, AnalysisType } from "../ports/analysis.ports";
import type { BubbleLayerType, BubbleRecord } from "@/features/Bubbly/types/bubble";

const analysisTypeToLayerType: Record<AnalysisType, BubbleLayerType> = {
    metadata_inspection: "corpusMetadata",
    corpus_sampler: "corpusSampler",
    lb_extraction: "lbExtraction",
    lb_analysis: "lbAnalysis"
}

export function mapAnalysisTypeToLayerType(
    analysisType: AnalysisType
): BubbleLayerType {
    return analysisTypeToLayerType[analysisType];
}

export function mapAnalysisResponseToBubbleRecord(
    analysis: AnalysisResponse
): BubbleRecord {
    return {
        bubbleId: analysis.uuid,
        analysisName: analysis.analysisName,
        layerType: mapAnalysisTypeToLayerType(analysis.analysisType),
        displayName: analysis.displayName,
        description: analysis.description,
        order: null,
    };
}