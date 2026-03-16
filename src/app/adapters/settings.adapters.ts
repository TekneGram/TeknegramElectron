import { invokeRequest } from "./invokeRequest";
import type {
    DeleteApiProviderKeyRequest,
    DeleteApiProviderKeyResponse,
    ListApiProviderModelsResponse,
    ListApiProvidersResponse,
    SaveApiProviderKeyRequest,
    SaveApiProviderKeyResponse,
    SetDefaultApiProviderRequest,
    SetDefaultApiProviderResponse,
    SettingsPort,
    UpdateApiProviderModelRequest,
    UpdateApiProviderModelResponse,
} from "@/app/ports/settings.ports";

export const settingsAdapter: SettingsPort = {
    async listApiProviders() {
        return invokeRequest<null, ListApiProvidersResponse>("settings:api-providers:list", null);
    },

    async listApiProviderModels() {
        return invokeRequest<null, ListApiProviderModelsResponse>("settings:api-providers:list-models", null);
    },

    async saveApiProviderKey(request: SaveApiProviderKeyRequest) {
        return invokeRequest<SaveApiProviderKeyRequest, SaveApiProviderKeyResponse>(
            "settings:api-providers:save-key",
            request,
        );
    },

    async deleteApiProviderKey(request: DeleteApiProviderKeyRequest) {
        return invokeRequest<DeleteApiProviderKeyRequest, DeleteApiProviderKeyResponse>(
            "settings:api-providers:delete-key",
            request,
        );
    },

    async setDefaultApiProvider(request: SetDefaultApiProviderRequest) {
        return invokeRequest<SetDefaultApiProviderRequest, SetDefaultApiProviderResponse>(
            "settings:api-providers:set-default",
            request,
        );
    },

    async updateApiProviderModel(request: UpdateApiProviderModelRequest) {
        return invokeRequest<UpdateApiProviderModelRequest, UpdateApiProviderModelResponse>(
            "settings:api-providers:update-model",
            request,
        );
    },
};
