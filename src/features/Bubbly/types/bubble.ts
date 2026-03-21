//import { AnalysisType } from "@/app/ports/analysis.ports";

export type BubbleLayerType = 
    | 'corpusMetadata'
    | 'corpusSampler'
    | 'lbExtraction'
    | 'lbAnalysis'

export interface BubbleRecord {
    bubbleId: string;
    analysisName: string;
    layerType: BubbleLayerType;
    displayName: string;
    description: string | null;
    order: number | null;
}