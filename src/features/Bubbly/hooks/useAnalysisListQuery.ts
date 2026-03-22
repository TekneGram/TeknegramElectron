import { useQuery } from "@tanstack/react-query";
import { analysisAdapter } from "@/app/adapters/analysis.adapters";
import { fetchBubbleWrapList } from "../services/analysisList.service";

export const analysisListQueryKey = (activityId: string) => ["analysis", activityId] as const;

export function useAnalysisListQuery(activityId: string) {
    const analysisListRequest = {
        activityId: activityId
    }

    return useQuery({
        queryKey: analysisListQueryKey(activityId),
        queryFn: () => fetchBubbleWrapList(analysisAdapter, analysisListRequest),
    });
}