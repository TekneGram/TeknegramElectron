import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    clearDefaultApiProvider,
    getApiProviderByName,
    setDefaultApiProvider as setDefaultApiProviderRow,
} from "@electron/db/repositories/apiRepositories";
import { runInTransaction } from "@electron/db/sqlite";
import type { SetDefaultApiProviderRequest, SetDefaultApiProviderResponse } from "@electron/ipc/contracts/settings.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "../logger";

export async function setDefaultApiProvider(
    request: SetDefaultApiProviderRequest,
    ctx: RequestContext,
): Promise<SetDefaultApiProviderResponse> {
    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const providerRow = getApiProviderByName(appDatabase.db, request.provider);

        if (!providerRow) {
            raiseAppError("RESOURCE_NOT_FOUND", `Unknown API provider "${request.provider}".`);
        }

        if (providerRow.has_stored_key !== 1) {
            raiseAppError(
                "VALIDATION_INVALID_STATE",
                `Provider "${request.provider}" cannot be set as default without a saved API key.`,
            );
        }

        logger.info("Setting default API provider", {
            correlationId: ctx.correlationId,
            provider: request.provider,
        });

        const updatedAt = new Date().toISOString();

        runInTransaction(appDatabase.db, () => {
            clearDefaultApiProvider(appDatabase.db, updatedAt);
            setDefaultApiProviderRow(appDatabase.db, {
                provider: request.provider,
                updated_at: updatedAt,
            });
        });

        logger.info("Default API provider set", {
            correlationId: ctx.correlationId,
            provider: request.provider,
        });

        return {
            provider: request.provider,
            isDefault: true,
        };
    } finally {
        appDatabase.close();
    }
}
