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
    stage: "credentials" | "prepare_request" | "provider_request" | "normalize_response";
    message: string;
};

export type CorpusMetadataSummaryResult = {
    summary: string;
    provider: string;
    model: string;
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
    fallbackUsed: false;
};

export type SummarizeCorpusMetadataBoundaryDto = 
    | { ok: true; data: CorpusMetadataSummaryResult }
    | {
        ok: false;
        error: {
            code:
                | "LLM_CREDENTIALS_MISSING"
                | "LLM_REQUEST_INVALID"
                | "LLM_PROVIDER_FAILED"
                | "LLM_POLICY_VIOLATION";
            message: string;
        };
    };

export type CredentialProvider = {
    getApiKey(provider: string): Promise<string | null>;
};

export type SummarizeCorpusMetadataControllerDeps = {
    credentialProvider: CredentialProvider;
    providerClient: LlmProviderClient;
    onProgress?: (event: SummarizeCorpusMetadataProgressEvent) => void;
};

export type LlmProviderRequest = {
    provider: string;
    apiKey: string;
    model: string;
    systemPrompt: string;
    responseFormatName: string;
    responseSchema: Record<string, unknown>;
    inputText: string;
};

export type LlmProviderResponse = {
    provider: string;
    model: string;
    outputText: string;
    usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
};

export type LlmProviderClient = {
    generateStructuredResponse(request: LlmProviderRequest): Promise<LlmProviderResponse>;
}