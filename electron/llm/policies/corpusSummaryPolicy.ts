import type {
    CorpusMetadataDerivedSummary,
    CorpusMetadataRoot,
} from "../shared/corpusMetadata.dto"

const DEFAULT_PROVIDER = "openai";
const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_DEPTH = 2;
const MAX_NESTED_PREVIEW = 8;

export type CorpusSummaryResolvedPolicy = {
    provider: string;
    model: string;
    systemPrompt: string;
    responseFormatName: string;
};

export function resolveCorpusSummaryPolicy(preferredModel?: string): CorpusSummaryResolvedPolicy {
    return {
        provider: DEFAULT_PROVIDER,
        model: preferredModel?.trim() || DEFAULT_MODEL,
        responseFormatName: "corpus_metadata_summary",
        systemPrompt: [
            "You summarize corpus metadata for end users.",
            "Return a concise overview in 2 or 2 sentences.",
            "Focus on scale, structure and notable disciplinary composition.",
            "Do not invent facts.",
            "Return valid JSON only."
        ].join(" "),
    };
}

export function deriveCorpusMetadataSummary(
    metadata: CorpusMetadataRoot,
): CorpusMetadataDerivedSummary {
    return {
        corpusName: metadata.corpus_name,
        totalDocs: metadata.docs,
        totalLemmas: metadata.lemmas,
        totalTypes: metadata.types,
        totalWords: metadata.words,
        topLevelSubcorporaCount: metadata.subcorpora.length,
        topLevelSubcorpora: metadata.subcorpora.map((node) => ({
            name: node.name,
            docs: node.docs,
            lemmas: node.lemmas,
            types: node.types,
            words: node.words,
            nestedSubcorporaCount: node.subcorpora.length,
            nestedSubcorporaPreview: node.subcorpora
                .slice(0, MAX_NESTED_PREVIEW)
                .map((child) => ({
                    name: child.name,
                    docs: child.docs,
                    lemmas: child.lemmas,
                    types: child.types,
                    words: child.words,
                })),
        })),
    };
}

export function enforceMetadataDepthLimit(metadata: CorpusMetadataRoot): void {
    for (const topLevel of metadata.subcorpora) {
        for (const child of topLevel.subcorpora) {
            if (child.subcorpora.length > 0) {
                throw new Error(
                    `<etadata exceeds supported depth of ${MAX_DEPTH}. Found nested entries. under "${child.name}".`,
                );
            }
        }
    }
}