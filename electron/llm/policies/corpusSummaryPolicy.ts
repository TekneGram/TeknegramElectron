import type {
    CorpusMetadataDerivedSummary,
    CorpusMetadataRoot,
} from "../shared/corpusMetadata.dto";
import type {
    LlmProviderName,
    ResolvedCorpusSummaryPolicy,
} from "../shared/llmProvider.dto";

const DEFAULT_PROVIDER: LlmProviderName = "openai";
const DEFAULT_MODELS: Record<LlmProviderName, string> = {
    openai: "gpt-4.1-mini",
    anthropic: "claude-3-5-sonnet-latest",
    gemini: "gemini-2.5-pro",
};
const MAX_DEPTH = 2;
const MAX_NESTED_PREVIEW = 8;

// Policy makes the final decision about the model even if the user requests a specific model.
export function resolveCorpusSummaryPolicy(args: {
    preferredProvider?: LlmProviderName;
    preferredModel?: string;
}): ResolvedCorpusSummaryPolicy {
    
    const provider = args.preferredProvider ?? DEFAULT_PROVIDER;
    const model = args.preferredModel?.trim() || DEFAULT_MODELS[provider];
    
    return {
        provider,
        model,
        responseFormatName: "corpus_metadata_summary",
        systemPrompt: [
            "You summarize corpus metadata for end users.",
            "Return a concise overview in 2 or 3 sentences.",
            "Focus on scale, structure, and notable disciplinary composition.",
            "Do not invent facts or infer unavailable information.",
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
                    `Metadata exceeds supported depth of ${MAX_DEPTH}. Found nested entries under "${child.name}".`,
                );
            }
        }
    }
}
