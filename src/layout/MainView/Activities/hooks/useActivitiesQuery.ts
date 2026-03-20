import { useQuery } from "@tanstack/react-query";
import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import type { ActivityRequestType, ActivityType } from "@/app/ports/activities.ports";
import { loadActivities } from "../services/getActivities.service";

export const activitiesQueryKey = (projectId: string, activityType: ActivityType) =>
    ["activities", projectId, activityType] as const;

type UseActivitiesQueryArgs = {
    projectId: string;
    activityType: ActivityType;
    requestType?: ActivityRequestType;
};

export function useActivitiesQuery({ projectId, activityType, requestType = "get" }: UseActivitiesQueryArgs) {
    return useQuery({
        queryKey: activitiesQueryKey(projectId, activityType),
        queryFn: () =>
            loadActivities(activitiesAdapter, {
                projectId,
                activityType,
                requestType,
            }),
    });
}
