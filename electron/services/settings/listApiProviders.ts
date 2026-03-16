import type { RequestContext } from "@electron/core/requestContext"
import { logger } from "@electron/services/logger";
import { createAppDatabase } from "@electron/db/appDatabase";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { listApiProvidersRows } from "@electron/db/repositories/apiRepositories";
import type { ApiProvidersResponse, ApiProvidersDto } from "@electron/ipc/contracts/settings.contracts";
import type { CredentialProvider, LlmProviderName } from "@electron/llm/shared/llmProvider.dto";

export async function listApiProviders(
    ctx: RequestContext,
    credentialProvider: CredentialProvider
): Promise<ApiProvidersResponse> {

    logger.info("Getting inference provider API keys", {
        correlationId: ctx.correlationId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const rows = listApiProvidersRows(appDatabase.db);

        logger.info("Inference provider API keys listed", {
            correlationId: ctx.correlationId,
            count: rows.length
        });

        const providers = await Promise.all(
            rows.map(async (row): Promise<ApiProvidersDto> => {
                const provider = row.provider as LlmProviderName;
                const apiKey = row.has_stored_key === 1
                    ? await credentialProvider.getApiKey(provider)
                    : null;

                return {
                    provider,
                    displayName: row.display_name,
                    maskedApiKey: apiKey ? maskApiKey(apiKey) : null,
                    hasStoredKey: apiKey !== null,
                    isDefault: row.is_default === 1,
                    defaultModel: row.default_model
                };
            }),
        );
        return { providers };
    } finally {
        appDatabase.close()
    }
}

function maskApiKey(value: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
        return "";
    }

    if (trimmed.length <= 4) {
        return "*".repeat(trimmed.length);
    }

    if (trimmed.length <= 9) {
        return `${trimmed.slice(0, 2)}*****${trimmed.slice(-2)}`;
    }

    return `${trimmed.slice(0, 2)}*****${trimmed.slice(-2)}`;
}

// export type ApiProvidersDto = {
//     provider: "openai" | "anthropic" | "gemini";
//     displayName: string;
//     maskedApiKey: string | null;
//     hasStoredKey: boolean;
//     isDefault: boolean;
//     defaultModel: string;
// }
