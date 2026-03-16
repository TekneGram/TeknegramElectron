import type { CredentialProvider, LlmProviderName } from "./shared/llmProvider.dto";
import type { SecretStoragePort } from "@electron/infrastructure/ports/secretStorage.port";

export function getProviderSecretKey(provider: LlmProviderName): string {
    switch (provider) {
        case "openai":
            return "llm.openai.apiKey";
        case "anthropic":
            return "llm.anthropic.apiKey";
        case "gemini":
            return "llm.gemini.apiKey";
    }
}

export function createCredentialProvider(
    secretStorage: SecretStoragePort,
): CredentialProvider {
    return {
        async getApiKey(provider: LlmProviderName): Promise<string | null> {
            return secretStorage.getSecret(getProviderSecretKey(provider));
        }
    }
}
