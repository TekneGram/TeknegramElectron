
// For identifying the type of analysis
export const ANALYSIS_TYPES = ["metadata_inspection", "corpus_sampler", "lb_extraction", "lb_analysis"] as const;
export type AnalysisType = (typeof ANALYSIS_TYPES)[number];

// For getting the list of analyses done on a particular activity
export type GetAnalysisListRequest = {
    activityId: string;
}

// One analysis done on an activity
export type AnalysisArtifact = {
    uuid: string;
    analysisName: string;
    analysisType: AnalysisType,
    config: string | null;
    displayName: string;
    description: string;
}

// The full list of analyses done on the activity
export type AnalysisArtifactList = AnalysisArtifact[];

// Creating an analysis
export type CreateAnalysisRequest = {
    corpusId: string;
    activityId: string;
    analysisType: AnalysisType;
    config: string | null;
}

// For returning the metadata_inspection response
export type CorpusMetadataInspectionResponse = {
    analysis: {
        uuid: string;
        analysisName: string;
        analysisType: AnalysisType;
        config: string | null;
        displayName: string;
        description: string;
    };
    analysisData: {
        corpusUuid: string;
        metadataJson: string;
        summaryText: string;
        llmProvider: string | null;
        llmModel: string | null;
        binaryFilesPath: string | null;
    };
}
