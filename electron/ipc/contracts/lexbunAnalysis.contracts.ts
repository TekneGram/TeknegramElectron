export const ANALYSIS_TYPES = ["metadata_inspection", "corpus_sampler", "lb_extraction", "lb_analysis"] as const;
export type AnalysisType = (typeof ANALYSIS_TYPES)[number];

export type GetAnalysisRequest = {

}

export type CreateAnalysisRequest = {
    corpusId: string;
    activityId: string;
    analysisType: AnalysisType;
}

export type AnalysisDetails = {
    
}

export type AnalysisResponse = {

}