export type ApiProvidersDto = {
    provider: "openai" | "anthropic" | "gemini";
    displayName: string;
    maskedApiKey: string | null;
    hasStoredKey: boolean;
    isDefault: boolean;
    defaultModel: string;
}

export type ApiProvidersResponse = {
    providers: ApiProvidersDto[];
}

export type ApiProviderRequest = {
    requestId: string;
}