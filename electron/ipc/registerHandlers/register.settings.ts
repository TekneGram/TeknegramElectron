import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";

import { deleteApiProviderKey } from "@electron/services/settings/deleteApiProviderKey";
import { listApiProviders } from "@electron/services/settings/listApiProviders";
import { saveApiProviderKey } from "@electron/services/settings/saveApiProviderKey";
import { setDefaultApiProvider } from "@electron/services/settings/setDefaultApiProvider";
import type {
    ApiProvidersResponse,
    DeleteApiProviderKeyRequest,
    DeleteApiProviderKeyResponse,
    SaveApiProviderKeyRequest,
    SaveApiProviderKeyResponse,
    SetDefaultApiProviderRequest,
    SetDefaultApiProviderResponse,
} from "../contracts/settings.contracts";
import {
    deleteApiProviderKeySchema,
    saveApiProviderKeySchema,
    setDefaultApiProviderSchema,
} from "../validationSchemas/settings.schemas";

import { createCredentialProvider } from "@electron/llm/createCredentialProvider";
import { secretStorageAdapter } from "@electron/infrastructure/adapters/secretStorage.adapter";

const credentialProvider = createCredentialProvider(secretStorageAdapter);

export function registerSettingsHandlers(): void {
    safeHandle<null, ApiProvidersResponse>(
        "settings:api-providers:list",
        async (_event, _rawArgs, ctx) => {
            return listApiProviders(ctx, credentialProvider);
        }
    );

    safeHandle<SaveApiProviderKeyRequest, SaveApiProviderKeyResponse>(
        "settings:api-providers:save-key",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(saveApiProviderKeySchema, rawArgs);
            return saveApiProviderKey(args, ctx, secretStorageAdapter);
        }
    );

    safeHandle<DeleteApiProviderKeyRequest, DeleteApiProviderKeyResponse>(
        "settings:api-providers:delete-key",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(deleteApiProviderKeySchema, rawArgs);
            return deleteApiProviderKey(args, ctx, secretStorageAdapter);
        }
    );

    safeHandle<SetDefaultApiProviderRequest, SetDefaultApiProviderResponse>(
        "settings:api-providers:set-default",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(setDefaultApiProviderSchema, rawArgs);
            return setDefaultApiProvider(args, ctx);
        }
    );
}
