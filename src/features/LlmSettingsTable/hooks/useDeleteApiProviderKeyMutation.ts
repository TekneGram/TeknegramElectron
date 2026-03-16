import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsAdapter } from "@/app/adapters/settings.adapters";
import type {
    DeleteApiProviderKeyRequest,
    DeleteApiProviderKeyResponse,
} from "@/app/ports/settings.ports";
import { deleteApiProviderKey } from "../services/deleteApiProviderKey.service";
import { llmProviderSettingsQueryKey } from "./useLlmProviderSettingsQuery";

export function useDeleteApiProviderKeyMutation() {
    const queryClient = useQueryClient();

    return useMutation<DeleteApiProviderKeyResponse, Error, DeleteApiProviderKeyRequest>({
        mutationFn: (request) => deleteApiProviderKey(settingsAdapter, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: llmProviderSettingsQueryKey });
        },
    });
}
