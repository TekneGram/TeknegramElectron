import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    getApiProviderByName,
    getApiProviderModelById,
    updateApiProviderModel as updateApiProviderModelRow,
} from "@electron/db/repositories/apiRepositories";
import type {
    UpdateApiProviderModelRequest,
    UpdateApiProviderModelResponse,
} from "@electron/ipc/contracts/settings.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "../logger";

export async function updateApiProviderModel(
    request: UpdateApiProviderModelRequest,
    ctx: RequestContext,
): Promise<UpdateApiProviderModelResponse> {
    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const providerRow = getApiProviderByName(appDatabase.db, request.provider);

        if (!providerRow) {
            raiseAppError("RESOURCE_NOT_FOUND", `Unknown API provider "${request.provider}".`);
        }

        const modelRow = getApiProviderModelById(appDatabase.db, request.provider, request.modelId);

        if (!modelRow) {
            raiseAppError(
                "VALIDATION_INVALID_PAYLOAD",
                `Model "${request.modelId}" is not supported for provider "${request.provider}".`,
            );
        }

        logger.info("Updating default API provider model", {
            correlationId: ctx.correlationId,
            provider: request.provider,
            modelId: request.modelId,
        });

        updateApiProviderModelRow(appDatabase.db, {
            provider: request.provider,
            default_model: request.modelId,
            updated_at: new Date().toISOString(),
        });

        logger.info("Default API provider model updated", {
            correlationId: ctx.correlationId,
            provider: request.provider,
            modelId: request.modelId,
        });

        return {
            provider: request.provider,
            modelId: request.modelId,
        };
    } finally {
        appDatabase.close();
    }
}
