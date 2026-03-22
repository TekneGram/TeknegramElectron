import { useMutation, useQueryClient } from "@tanstack/react-query";
import { analysisAdapter } from "@/app/adapters/analysis.adapters";
import type {
    AnalysisCorpusMetadataResponse,
    CreateAnalysisRequest
} from '@/app/ports/analysis.ports';

import { createMetadataInspection } from "../services/createMetadataInspection.service";
import { analysisListQueryKey } from "@/features/Bubbly/hooks/useAnalysisListQuery";

type UseCreateMetadataInspectionMutationArgs = {
    activityId: string;
    onSuccess?: (result: AnalysisCorpusMetadataResponse) => void;
};

export function useCreateMetadataInspectionMutation({
    activityId,
    onSuccess,
}: UseCreateMetadataInspectionMutationArgs) {
    const queryClient = useQueryClient();

    return useMutation<AnalysisCorpusMetadataResponse, Error, CreateAnalysisRequest>({
        mutationFn: (request) =>
            createMetadataInspection(analysisAdapter, request),

        onSuccess: async (result) => {
            await queryClient.invalidateQueries({
                queryKey: analysisListQueryKey(activityId),
            });

            onSuccess?.(result);
        }
    })
}