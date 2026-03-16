import { openAiResponseClient } from "./openAiResponseClient"
import type {
    LlmProviderClient,
    LlmProviderName,
    LlmProviderRegistry,
} from "../shared/llmProvider.dto"

export function createLlmProviderRegistry(): LlmProviderRegistry {
    const clients: Partial<Record<LlmProviderName, LlmProviderClient>> = {
        openai: openAiResponseClient,
    };

    return {
        getClient(provider: LlmProviderName): LlmProviderClient {
            const client = clients[provider];

            if (!client) {
                throw new Error(`Unsupported provider "${provider}".`);
            }

            return client;
        }
    }
}
