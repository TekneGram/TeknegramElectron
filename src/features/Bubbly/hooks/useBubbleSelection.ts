import { useEffect, useMemo, useState } from 'react';
import type { BubbleRecord } from '../types/bubble';

export function useBubbleSelection(bubbles: BubbleRecord[]) {
    const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);

    useEffect(() => {
        if (bubbles.length === 0) {
            setActiveBubbleId(null);
            return;
        }

        setActiveBubbleId((current) => 
            current && bubbles.some((bubble) => bubble.bubbleId === current)
            ? current
            : bubbles[0].bubbleId,
        );
    }, [bubbles]);

    const activeBubble = useMemo(
        () => bubbles.find((bubble) => bubble.bubbleId === activeBubbleId) ?? null,
        [activeBubbleId, bubbles]
    );

    return {
        activeBubble,
        activeBubbleId,
        setActiveBubbleId,
    };
}