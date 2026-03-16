import type { AppResult } from "../types/result";

export type LlmProviderName = "openai" | "anthropic" | "gemini";

export interface ApiProviderSettingsItem {
    provider: LlmProviderName;
    displayName: string;
    maskedApiKey: string | null;
    hasStoredKey: boolean;
    isDefault: boolean;
    defaultModel: string;
}

export interface ApiProviderModelItem {
    provider: LlmProviderName;
    modelId: string;
    displayName: string;
}

export interface ListApiProvidersResponse {
    providers: ApiProviderSettingsItem[];
}

export interface ListApiProviderModelsResponse {
    models: ApiProviderModelItem[];
}

export interface SaveApiProviderKeyRequest {
    provider: LlmProviderName;
    apiKey: string;
}

export interface SaveApiProviderKeyResponse {
    provider: LlmProviderName;
    hasStoredKey: true;
}

export interface DeleteApiProviderKeyRequest {
    provider: LlmProviderName;
}

export interface DeleteApiProviderKeyResponse {
    provider: LlmProviderName;
    hasStoredKey: false;
}

export interface SetDefaultApiProviderRequest {
    provider: LlmProviderName;
}

export interface SetDefaultApiProviderResponse {
    provider: LlmProviderName;
    isDefault: true;
}

export interface UpdateApiProviderModelRequest {
    provider: LlmProviderName;
    modelId: string;
}

export interface UpdateApiProviderModelResponse {
    provider: LlmProviderName;
    modelId: string;
}

export interface SettingsPort {
    listApiProviders(): Promise<AppResult<ListApiProvidersResponse>>;
    listApiProviderModels(): Promise<AppResult<ListApiProviderModelsResponse>>;
    saveApiProviderKey(request: SaveApiProviderKeyRequest): Promise<AppResult<SaveApiProviderKeyResponse>>;
    deleteApiProviderKey(request: DeleteApiProviderKeyRequest): Promise<AppResult<DeleteApiProviderKeyResponse>>;
    setDefaultApiProvider(request: SetDefaultApiProviderRequest): Promise<AppResult<SetDefaultApiProviderResponse>>;
    updateApiProviderModel(request: UpdateApiProviderModelRequest): Promise<AppResult<UpdateApiProviderModelResponse>>;
}
