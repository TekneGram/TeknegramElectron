import { AppResult } from "../types/result";

export type AnalysisType = 
    | "metadata_inspection" 
    | "corpus_sampler" 
    | "lb_extraction" 
    | "lb_analysis";


export type CorpusMetadataNode = {
    name: string;
    docs: number;
    lemmas: number;
    types: number;
    words: number;
    subcorpora: CorpusMetadataNode[];
};

export type CorpusMetadataRoot = {
    corpus_name: string;
    docs: number;
    lemmas: number;
    types: number;
    words: number;
    subcorpora: CorpusMetadataNode[];
};

export type GetAnalysisListRequest = {
    activityId: string;
}

export type AnalysisArtifactResponse = {
    uuid: string;
    analysisName: string;
    analysisType: AnalysisType,
    config: string | null;
    displayName: string;
    description: string;
}

export type AnalysisListResponse = AnalysisArtifactResponse[];

export type CreateAnalysisRequest = {
    corpusId: string;
    activityId: string;
    analysisType: AnalysisType;
    config: string | null;
}

export type AnalysisDataResponse = {
    corpusUuid: string;
    metadataJson: string;
    summaryText: string;
    llmProvider: string | null;
    llmModel: string | null;
    binaryFilesPath: string | null
}

export type FullAnalysisResponse = {
    analysis: AnalysisArtifactResponse;
    analysisData: AnalysisDataResponse;
}

export interface AnalysisPorts {
    getAnalysisList(request: GetAnalysisListRequest): Promise<AppResult<AnalysisListResponse>>;
    createMetadataInspectionAnalysis(request: CreateAnalysisRequest): Promise<AppResult<FullAnalysisResponse>>;
}
