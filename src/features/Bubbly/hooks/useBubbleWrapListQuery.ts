import { useQuery } from "@tanstack/react-query";
import { analysisAdapter } from "@/app/adapters/analysis.adapters";
import { fetchBubbleWrapList } from "../services/bubbleWrapList.service";

export const bubbleWrapListQueryKey = (activityId: string) => ["analysis", activityId] as const;

export function useBubbleWrapListQuery(activityId: string) {
    const bubbleWrapListRequest = {
        activityId: activityId
    }

    return useQuery({
        queryKey: bubbleWrapListQueryKey(activityId),
        queryFn: () => fetchBubbleWrapList(analysisAdapter, bubbleWrapListRequest),
    });
}