import { useMutation, useQueryClient } from "@tanstack/react-query";

import { analysisAdapter } from "@/app/adapters/analysis.adapters";
import { blowBubble } from "../services/bubbleBlower.service";
import { bubbleWrapListQueryKey } from "./useBubbleWrapListQuery";

import type { BubbleBlower, FullBubble } from "../types/bubble";

type UseBubbleBlowerArgs = {
    activityId: string;
    onSuccess?: (fullBubble: FullBubble) => void;
};

export function useBubbleBlower({ activityId, onSuccess }: UseBubbleBlowerArgs) {
    const queryClient = useQueryClient();

    return useMutation<FullBubble, Error, BubbleBlower>({
        mutationFn: (input) =>
            blowBubble(analysisAdapter, {
                ...input,
                activityId,
            }),
        onSuccess: async (fullBubble) => {
            await queryClient.invalidateQueries({
                queryKey: bubbleWrapListQueryKey(activityId)
            });

            onSuccess?.(fullBubble);
        }
    })
}