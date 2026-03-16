import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getApiProviderByName,
    updateApiProviderStoredKeyStatus,
} from "@electron/db/repositories/apiRepositories";
import type { DeleteApiProviderKeyRequest, DeleteApiProviderKeyResponse } from "@electron/ipc/contracts/settings.contracts";
import { getProviderSecretKey } from "@electron/llm/createCredentialProvider";
import type { SecretStoragePort } from "@electron/infrastructure/ports/secretStorage.port";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "../logger";

export async function deleteApiProviderKey(
    request: DeleteApiProviderKeyRequest,
    ctx: RequestContext,
    secretStorage: SecretStoragePort,
): Promise<DeleteApiProviderKeyResponse> {
    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const providerRow = getApiProviderByName(appDatabase.db, request.provider);

        if (!providerRow) {
            raiseAppError("RESOURCE_NOT_FOUND", `Unknown API provider "${request.provider}".`);
        }

        logger.info("Deleting API provider key", {
            correlationId: ctx.correlationId,
            provider: request.provider,
        });

        try {
            await secretStorage.deleteSecret(getProviderSecretKey(request.provider));
        } catch (error) {
            logger.error("Failed to delete API provider key from secret storage", {
                correlationId: ctx.correlationId,
                provider: request.provider,
                error: error instanceof Error ? error.message : String(error),
            });
            raiseAppError("FS_WRITE_FAILED", "Failed to securely delete API provider key.");
        }

        updateApiProviderStoredKeyStatus(appDatabase.db, {
            provider: request.provider,
            has_stored_key: 0,
            updated_at: new Date().toISOString(),
        });

        logger.info("API provider key deleted", {
            correlationId: ctx.correlationId,
            provider: request.provider,
        });

        return {
            provider: request.provider,
            hasStoredKey: false,
        };
    } finally {
        appDatabase.close();
    }
}
