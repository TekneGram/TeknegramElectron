import { useQuery } from "@tanstack/react-query"
import type { BubbleRecord } from "../types/bubble"
import { bubbleRegistry } from "../registry/bubbleRegistry"

export function useBubbleLayerQuery(activeBubble: BubbleRecord | null) {
    return useQuery({
        queryKey: ['bubble-layer', activeBubble?.bubbleId],
        enabled: Boolean(activeBubble),
        queryFn: async () => {
            if (!activeBubble) {
                throw new Error('An active bubble is required to fetch layer data');
            }

            const entry = bubbleRegistry[activeBubble.layerType]
            return entry.fetcher(activeBubble.bubbleId);
        }
    })
}