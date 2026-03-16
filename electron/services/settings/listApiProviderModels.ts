import type { RequestContext } from "@electron/core/requestContext";
import { createAppDatabase } from "@electron/db/appDatabase";
import { listApiProviderModelsRows } from "@electron/db/repositories/apiRepositories";
import type {
    ApiProviderModelDto,
    ListApiProviderModelsResponse,
} from "@electron/ipc/contracts/settings.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "../logger";

export async function listApiProviderModels(
    ctx: RequestContext,
): Promise<ListApiProviderModelsResponse> {
    logger.info("Listing curated API provider models", {
        correlationId: ctx.correlationId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const rows = listApiProviderModelsRows(appDatabase.db);

        const models: ApiProviderModelDto[] = rows.map((row) => ({
            provider: row.provider as ApiProviderModelDto["provider"],
            modelId: row.model_id,
            displayName: row.display_name,
        }));

        return { models };
    } finally {
        appDatabase.close();
    }
}
