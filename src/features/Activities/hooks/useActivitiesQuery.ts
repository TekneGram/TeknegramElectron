import { useQuery } from "@tanstack/react-query";
import { activitiesAdapter } from "@/app/adapters/activities.adapters";
import { loadActivities } from "../services/getActivities.service";

export const activitiesQueryKey = (projectId: string) =>
    ["activities", projectId] as const;

type UseActivitiesQueryArgs = {
    projectId: string;
};

export function useActivitiesQuery({ projectId }: UseActivitiesQueryArgs) {
    return useQuery({
        queryKey: activitiesQueryKey(projectId),
        queryFn: () =>
            loadActivities(activitiesAdapter, {
                projectId,
            }),
    });
}
