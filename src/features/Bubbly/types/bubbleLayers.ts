export interface CorpusMetadataLayerDataNode {
    name: string;
    docs: number;
    lemmas: number;
    types: number;
    words: number;
    subcorpora: CorpusMetadataLayerDataNode[];
};

export interface CorpusMetadataLayerData {
    corpusName: string;
    docs: number;
    lemmas: number;
    types: number;
    words: number;
    subcorpora: CorpusMetadataLayerDataNode[]
}

export interface Temporary {
    name: string;
}

export type BubbleLayerDataMap = {
    corpusMetadata: CorpusMetadataLayerData;
    corpusSampler: Temporary;
    lbExtraction: Temporary;
    lbAnalysis: Temporary;
}