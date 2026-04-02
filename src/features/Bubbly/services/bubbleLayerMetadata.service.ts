import { CorpusMetadataRoot } from "@/app/ports/analysis.ports";

export async function fetchBubbleLayerMetadata(): Promise<CorpusMetadataRoot> {
    let a: CorpusMetadataRoot = {
        corpus_name: "test",
        docs: 3,
        lemmas: 12,
        types: 14,
        words: 88,
        subcorpora: []
    };

    return a;
}