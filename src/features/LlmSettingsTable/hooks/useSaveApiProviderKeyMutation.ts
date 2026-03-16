import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsAdapter } from "@/app/adapters/settings.adapters";
import type {
    SaveApiProviderKeyRequest,
    SaveApiProviderKeyResponse,
} from "@/app/ports/settings.ports";
import { saveApiProviderKey } from "../services/saveApiProviderKey.service";
import { llmProviderSettingsQueryKey } from "./useLlmProviderSettingsQuery";

export function useSaveApiProviderKeyMutation() {
    const queryClient = useQueryClient();

    return useMutation<SaveApiProviderKeyResponse, Error, SaveApiProviderKeyRequest>({
        mutationFn: (request) => saveApiProviderKey(settingsAdapter, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: llmProviderSettingsQueryKey });
        },
    });
}
