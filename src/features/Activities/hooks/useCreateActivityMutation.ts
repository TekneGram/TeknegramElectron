import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import type { ActivityRequest, ActivityResponse } from "@/app/ports/activities.ports";
import { activitiesQueryKey } from "./useActivitiesQuery";
import { submitActivityCreation } from "../services/createActivity.service";

export function useCreateActivityMutation() {
    const queryClient = useQueryClient();

    return useMutation<ActivityResponse, Error, ActivityRequest>({
        mutationFn: (request) => submitActivityCreation(activitiesAdapter, request),
        onSuccess: async (data, variables) => {
            queryClient.setQueryData(
                activitiesQueryKey(variables.projectId, variables.activityType),
                data,
            );
            await queryClient.invalidateQueries({
                queryKey: activitiesQueryKey(variables.projectId, variables.activityType),
            });
        },
    });
}
