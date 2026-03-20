import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import type { CreateActivityRequest, ActivityResponse } from "@/app/ports/activities.ports";
import { activitiesQueryKey } from "./useActivitiesQuery";
import { submitActivityCreation } from "../services/createActivity.service";

export function useCreateActivityMutation() {
    const queryClient = useQueryClient();

    return useMutation<ActivityResponse, Error, CreateActivityRequest>({
        mutationFn: (request) => submitActivityCreation(activitiesAdapter, request),
        onSuccess: async (data, variables) => {
            queryClient.setQueryData(
                activitiesQueryKey(variables.projectId),
                data,
            );
            await queryClient.invalidateQueries({
                queryKey: activitiesQueryKey(variables.projectId),
            });
        },
    });
}
