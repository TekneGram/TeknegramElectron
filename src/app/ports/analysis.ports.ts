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