export type ApiProvidersDto = {
    provider: "openai" | "anthropic" | "gemini";
    displayName: string;
    maskedApiKey: string | null;
    hasStoredKey: boolean;
    isDefault: boolean;
    defaultModel: string;
};

export type ApiProvidersResponse = {
    providers: ApiProvidersDto[];
};

export type ListApiProvidersRequest = null;

export type ApiProviderModelDto = {
    provider: "openai" | "anthropic" | "gemini";
    modelId: string;
    displayName: string;
};

export type ListApiProviderModelsRequest = null;

export type ListApiProviderModelsResponse = {
    models: ApiProviderModelDto[];
};

export type SaveApiProviderKeyRequest = {
    provider: "openai" | "anthropic" | "gemini";
    apiKey: string;
};

export type SaveApiProviderKeyResponse = {
    provider: "openai" | "anthropic" | "gemini";
    hasStoredKey: true;
};

export type DeleteApiProviderKeyRequest = {
    provider: "openai" | "anthropic" | "gemini";
};

export type DeleteApiProviderKeyResponse = {
    provider: "openai" | "anthropic" | "gemini";
    hasStoredKey: false;
};

export type SetDefaultApiProviderRequest = {
    provider: "openai" | "anthropic" | "gemini";
};

export type SetDefaultApiProviderResponse = {
    provider: "openai" | "anthropic" | "gemini";
    isDefault: true;
};

export type UpdateApiProviderModelRequest = {
    provider: "openai" | "anthropic" | "gemini";
    modelId: string;
};

export type UpdateApiProviderModelResponse = {
    provider: "openai" | "anthropic" | "gemini";
    modelId: string;
};
