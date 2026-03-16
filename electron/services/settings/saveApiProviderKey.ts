import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getApiProviderByName,
    updateApiProviderStoredKeyStatus,
} from "@electron/db/repositories/apiRepositories";
import type { SaveApiProviderKeyRequest, SaveApiProviderKeyResponse } from "@electron/ipc/contracts/settings.contracts";
import { getProviderSecretKey } from "@electron/llm/createCredentialProvider";
import type { SecretStoragePort } from "@electron/infrastructure/ports/secretStorage.port";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "../logger";

export async function saveApiProviderKey(
    request: SaveApiProviderKeyRequest,
    ctx: RequestContext,
    secretStorage: SecretStoragePort,
): Promise<SaveApiProviderKeyResponse> {
    const apiKey = request.apiKey.trim();

    if (!apiKey) {
        raiseAppError("VALIDATION_MISSING_FIELD", "API key cannot be empty.");
    }

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const providerRow = getApiProviderByName(appDatabase.db, request.provider);

        if (!providerRow) {
            raiseAppError("RESOURCE_NOT_FOUND", `Unknown API provider "${request.provider}".`);
        }

        logger.info("Saving API provider key", {
            correlationId: ctx.correlationId,
            provider: request.provider,
        });

        try {
            await secretStorage.setSecret(getProviderSecretKey(request.provider), apiKey);
        } catch (error) {
            logger.error("Failed to save API provider key in secret storage", {
                correlationId: ctx.correlationId,
                provider: request.provider,
                error: error instanceof Error ? error.message : String(error),
            });
            raiseAppError("FS_WRITE_FAILED", "Failed to securely save API provider key.");
        }

        updateApiProviderStoredKeyStatus(appDatabase.db, {
            provider: request.provider,
            has_stored_key: 1,
            updated_at: new Date().toISOString(),
        });

        logger.info("API provider key saved", {
            correlationId: ctx.correlationId,
            provider: request.provider,
        });

        return {
            provider: request.provider,
            hasStoredKey: true,
        };
    } finally {
        appDatabase.close();
    }
}
