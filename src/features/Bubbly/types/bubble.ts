//import { AnalysisType } from "@/app/ports/analysis.ports";

export type BubbleLayerType = 
    | 'corpusMetadata'
    | 'corpusSampler'
    | 'lbExtraction'
    | 'lbAnalysis';

// Used for the bubbles == AnalysisArtifacts from db
export interface BubbleRecord {
    bubbleId: string;
    analysisName: string;
    bubbleLayerType: BubbleLayerType;
    displayName: string;
    description: string | null;
    order: number | null;
}

// Used for results of analysis
export interface BubbleLayerData {
    parentContextId: string; // Refers to a specific corpus
    data: string; // Should be converted into specific JSON that will be converted for different display types
    summary: string | null;
    llmProvider: string | null;
    llmModel: string | null;
    binaryFilesPath: string | null;
}

export interface FullBubble {
    bubbleRecord: BubbleRecord;
    bubbleLayerData: BubbleLayerData;
}

export type BubbleBlower = {
    parentContextId: string; // Refers to a specific corpus
    activityId: string;
    bubbleLayerType: BubbleLayerType;
    config?: string | null;
}