export type AnalysisType = "metadata_inspector" | "corpus_samples" | "lb_extraction" | "lb_analysis";



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
    subcorpora: CorpusMetadataNode[]
};