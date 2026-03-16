import type {
    CredentialProvider,
    LlmProviderName,
    LlmProviderRegistry,
} from "./llmProvider.dto";

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

export type CorpusMetadataSummaryInput = {
    metadata: CorpusMetadataRoot;
    preferredProvider?: LlmProviderName;
    preferredModel?: string;
};

export type CorpusMetadataDerivedSummary = {
    corpusName: string;
    totalDocs: number;
    totalLemmas: number;
    totalTypes: number;
    totalWords: number;
    topLevelSubcorporaCount: number;
    topLevelSubcorpora: Array<{
        name: string;
        docs: number;
        lemmas: number;
        types: number;
        words: number;
        nestedSubcorporaCount: number;
        nestedSubcorporaPreview: Array<{
            name: string;
            docs: number;
            lemmas: number;
            types: number;
            words: number;
        }>;
    }>;
};

export type SummarizeCorpusMetadataProgressEvent = {
    stage: "policy" | "credentials" | "prepare_request" | "provider_request" | "normalize_response";
    message: string;
};

export type CorpusMetadataSummaryResult = {
    summary: string;
    provider: LlmProviderName;
    model: string;
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
    fallbackUsed: false;
};

export type SummarizeCorpusMetadataBoundaryError = {
    code:
        | "LLM_CREDENTIALS_MISSING"
        | "LLM_REQUEST_INVALID"
        | "LLM_RESPONSE_INVALID"
        | "LLM_PROVIDER_FAILED"
        | "LLM_POLICY_VIOLATION";
    message: string;
    details?: string;
};

export type SummarizeCorpusMetadataBoundaryDto = 
    | { ok: true; data: CorpusMetadataSummaryResult }
    | { ok: false; error: SummarizeCorpusMetadataBoundaryError };

export type SummarizeCorpusMetadataControllerDeps = {
    credentialProvider: CredentialProvider;
    providerRegistry: LlmProviderRegistry;
    onProgress?: (event: SummarizeCorpusMetadataProgressEvent) => void;
};
