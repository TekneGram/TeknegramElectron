export const ANALYSIS_TYPES = ["metadata_inspection", "corpus_sampler", "lb_extraction", "lb_analysis"] as const;
export type AnalysisType = (typeof ANALYSIS_TYPES)[number];

export type GetAnalysisRequest = {

}

export type CreateAnalysisRequest = {
    corpusId: string;
    activityId: string;
    analysisType: AnalysisType;
    config: string | null;
}

export type AnalysisCorpusMetadataResponse = {
    analysis: {
        uuid: string;
        analysisName: string;
        analysisType: AnalysisType;
        config: string | null;
        displayName: string;
        description: string | null;
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
