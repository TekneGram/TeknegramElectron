import { safeHandle } from "../safeHandle";

import { listApiProviders } from "@electron/services/settings/listApiProviders";
import type { ApiProvidersResponse } from "../contracts/settings.contracts";

import { createCredentialProvider } from "@electron/llm/createCredentialProvider";
import { secretStorageAdapter } from "@electron/infrastructure/adapters/secretStorage.adapter";

const credentialProvider = createCredentialProvider(secretStorageAdapter);

export function registerSettingsHandlers(): void {
    safeHandle<null, ApiProvidersResponse>(
        "settings:api-providers:list",
        async (_event, _rawArgs, ctx) => {
            //const args = validateOrThrow();
            return listApiProviders(ctx, credentialProvider);
        }
    )
}