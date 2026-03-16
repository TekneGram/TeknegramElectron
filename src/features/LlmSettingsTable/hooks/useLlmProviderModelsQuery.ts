import { useQuery } from "@tanstack/react-query";
import { settingsAdapter } from "@/app/adapters/settings.adapters";
import { listLlmProviderModels } from "../services/listLlmProviderModels.service";

export const llmProviderModelsQueryKey = ["settings", "api-provider-models"] as const;

export function useLlmProviderModelsQuery() {
    return useQuery({
        queryKey: llmProviderModelsQueryKey,
        queryFn: () => listLlmProviderModels(settingsAdapter),
    });
}
