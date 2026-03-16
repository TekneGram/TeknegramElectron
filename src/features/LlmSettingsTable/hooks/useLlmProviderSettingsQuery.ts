import { useQuery } from "@tanstack/react-query";
import { settingsAdapter } from "@/app/adapters/settings.adapters";
import { listLlmProviderSettings } from "../services/listLlmProviderSettings.service";

export const llmProviderSettingsQueryKey = ["settings", "api-providers"] as const;

export function useLlmProviderSettingsQuery() {
    return useQuery({
        queryKey: llmProviderSettingsQueryKey,
        queryFn: () => listLlmProviderSettings(settingsAdapter),
    });
}
