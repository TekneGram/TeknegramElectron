import type { AnalysisArtifactResponse, AnalysisDataResponse, AnalysisType } from "@/app/ports/analysis.ports";
import type { BubbleLayerData, BubbleLayerType, BubbleRecord } from "@/features/Bubbly/types/bubble";

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

/**
 * BUBBLE RECORD
 */
export function mapAnalysisResponseToBubbleRecord(
    analysisArtifact: AnalysisArtifactResponse
): BubbleRecord {
    return {
        bubbleId: analysisArtifact.uuid,
        analysisName: analysisArtifact.analysisName,
        bubbleLayerType: mapAnalysisTypeToLayerType(analysisArtifact.analysisType),
        displayName: analysisArtifact.displayName,
        description: analysisArtifact.description,
        order: null,
    };
}

const bubbleLayerTypeToAnalysisType: Record<BubbleLayerType, AnalysisType> = {
    corpusMetadata: "metadata_inspection",
    corpusSampler: "corpus_sampler",
    lbExtraction: "lb_extraction",
    lbAnalysis: "lb_analysis"
}

export function mapBubbleLayerTypeToAnalysisType(
    bubbleLayerType: BubbleLayerType
): AnalysisType {
    return bubbleLayerTypeToAnalysisType[bubbleLayerType];
}

/**
 * BUBBLE LAYER DATA
 */

export function mapAnalysisDataResponseToBubbleLayerData(
    analysisData: AnalysisDataResponse
): BubbleLayerData {
    return {
        parentContextId: analysisData.corpusUuid,
        data: analysisData.metadataJson,
        summary: analysisData.summaryText,
        llmProvider: analysisData.llmProvider,
        llmModel: analysisData.llmModel,
        binaryFilesPath: analysisData.binaryFilesPath,
    };
}