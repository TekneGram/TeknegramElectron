import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsAdapter } from "@/app/adapters/settings.adapters";
import type {
    UpdateApiProviderModelRequest,
    UpdateApiProviderModelResponse,
} from "@/app/ports/settings.ports";
import { updateApiProviderModel } from "../services/updateApiProviderModel.service";
import { llmProviderSettingsQueryKey } from "./useLlmProviderSettingsQuery";

export function useUpdateApiProviderModelMutation() {
    const queryClient = useQueryClient();

    return useMutation<UpdateApiProviderModelResponse, Error, UpdateApiProviderModelRequest>({
        mutationFn: (request) => updateApiProviderModel(settingsAdapter, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: llmProviderSettingsQueryKey });
        },
    });
}
