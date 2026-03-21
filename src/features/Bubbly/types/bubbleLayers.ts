import { CorpusMetadataRoot } from "@/app/ports/analysis.ports";


export type BubbleLayerDataMap = {
    corpusMetadata: CorpusMetadataRoot;
    corpusSampler: CorpusMetadataRoot;
    lbExtraction: CorpusMetadataRoot;
    lbAnalysis: CorpusMetadataRoot;
}