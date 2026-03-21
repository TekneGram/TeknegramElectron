import { useQuery } from "@tanstack/react-query";
import { analysisAdapter } from "@/app/adapters/analysis.adapters";
import { fetchBubbleWrapList } from "../services/analysisList.service";

export const analysisQueryKey = ["analysis"] as const;

export function useAnalysisListQuery(activityId: string) {
    const analysisListRequest = {
        activityId: activityId
    }
    return useQuery({
        queryKey: analysisQueryKey,
        queryFn: () => fetchBubbleWrapList(analysisAdapter, analysisListRequest),
    })
}