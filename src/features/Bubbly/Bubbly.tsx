import BubbleWrap from "./BubbleWrap"
import BubbleContainer from "./BubbleContainer";
import "./styles/bubbly.css";

import { useBubbleWrapListQuery } from "./hooks/useBubbleWrapListQuery";
import { useBubbleSelection } from "./hooks/useBubbleSelection";
import { useBubbleLayerQuery } from "./hooks/useBubbleLayerQuery";
import { BubbleBlower, BubbleRecord, FullBubble } from "./types/bubble";
import { mapAnalysisResponseToBubbleRecord } from "./mappers/bubbleWrap.mappers";
import { useBubbleBlower } from "./hooks/useBubbleBlower";
import { useEffect, useState } from "react";

interface BubblyProps {
    parentContextId: string | null;
    activityId: string;
    activityName: string;
    title: string;
    pendingBlowBubbleRequest: BubbleBlower | null;
    onBlowBubbleRequestHandled: () => void;
}

const Bubbly: React.FC<BubblyProps> = ({ activityId, activityName, title, pendingBlowBubbleRequest, onBlowBubbleRequestHandled }) => {

    const { data, isLoading, isError, error } = useBubbleWrapListQuery(activityId);

    const fetchedBubbles: BubbleRecord[] = (data ?? []).map(mapAnalysisResponseToBubbleRecord);

    const [blownBubble, setBlownBubble] = useState<FullBubble | null>(null);
    const bubbleBlower = useBubbleBlower({ 
        activityId,
        onSuccess: (fullBubble) => {
            setBlownBubble(fullBubble);
            setActiveBubbleId(fullBubble.bubbleRecord.bubbleId)
        }
    });

    const bubbles = blownBubble &&
                    !fetchedBubbles.some((bubble) => bubble.bubbleId === blownBubble.bubbleRecord.bubbleId)
                    ? [...fetchedBubbles, blownBubble.bubbleRecord]
                    : fetchedBubbles;

    const { activeBubble, activeBubbleId, setActiveBubbleId } = useBubbleSelection(bubbles);
    const layerQuery = useBubbleLayerQuery(activeBubble);

    useEffect(() => {
        if (!pendingBlowBubbleRequest) {
            return;
        }

        bubbleBlower.mutate(pendingBlowBubbleRequest);
        onBlowBubbleRequestHandled();
    }, [pendingBlowBubbleRequest, bubbleBlower, onBlowBubbleRequestHandled]);

    function mapBlownLayerData(fullBubble: FullBubble) {
        switch(fullBubble.bubbleRecord.bubbleLayerType) {
            case "corpusMetadata":
                return JSON.parse(fullBubble.bubbleLayerData.data);
            default:
                return undefined;
        }
    }

    const activeLayerData = activeBubble && blownBubble && activeBubble?.bubbleId === blownBubble?.bubbleRecord.bubbleId
        ? mapBlownLayerData(blownBubble)
        : layerQuery.data;
    

    return (
        <main className="bubbly">
            <div className="bubbly-frame">
                <header className="bubbly-header">
                    <div>
                        <p className="bubbly-eyebrow">{title}</p>
                        <h1 className="bubbly-title">{activityName}</h1>
                        <p className="bubbly-subtitle">More top matter</p>
                    </div>
                    <div className="bubbly-status">
                        <span className="bubbly-status-label">Bubbles count</span>
                        <span className="bubbly-status-value">{bubbles.length}</span>
                    </div>
                </header>
                <section className="bubbly-workspace">
                    <BubbleWrap 
                        bubbles={bubbles}
                        activeBubbleId={activeBubbleId}
                        onBubbleClick={setActiveBubbleId}
                    />
                    <BubbleContainer 
                        activeBubble={activeBubble}
                        data={activeLayerData}
                        isLoading={activeBubble?.bubbleId === blownBubble?.bubbleRecord.bubbleId ? false : layerQuery.isLoading}
                        isError={activeBubble?.bubbleId === blownBubble?.bubbleRecord.bubbleId ? false : layerQuery.isLoading}
                        error={activeBubble?.bubbleId === blownBubble?.bubbleRecord.bubbleId ? null : layerQuery.error}
                    />
                </section>
            </div>
        </main>
    );
};

export default Bubbly;