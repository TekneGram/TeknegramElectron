export type LlmProviderName = "openai" | "anthropic" | "gemini";

export type CredentialProvider = {
    getApiKey(provider: LlmProviderName): Promise<string | null>;
};

export type LlmProviderRequest = {
    provider: LlmProviderName;
    apiKey: string;
    model: string;
    systemPrompt: string;
    responseFormatName: string;
    responseSchema: Record<string, unknown>;
    inputText: string;
};

export type LlmProviderResponse = {
    provider: LlmProviderName;
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
};

export type LlmProviderRegistry = {
    getClient(provider: LlmProviderName): LlmProviderClient;
};

export type ResolvedCorpusSummaryPolicy = {
    provider: LlmProviderName;
    model: string;
    systemPrompt: string;
    responseFormatName: string;
};
