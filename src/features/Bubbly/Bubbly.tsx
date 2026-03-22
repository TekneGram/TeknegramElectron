import BubbleWrap from "./BubbleWrap"
import BubbleContainer from "./BubbleContainer";
import "./styles/bubbly.css";

import { useAnalysisListQuery } from "./hooks/useAnalysisListQuery";
import { useBubbleSelection } from "./hooks/useBubbleSelection";
import { useBubbleLayerQuery } from "./hooks/useBubbleLayerQuery";
import { BubbleRecord } from "./types/bubble";
import { mapAnalysisResponseToBubbleRecord } from "@/app/mappers/analysis.mappers";

interface BubblyProps {
    parentContextId: string | null;
    activityId: string;
    activityName: string;
    title: string;
}

const Bubbly: React.FC<BubblyProps> = ({ activityId, activityName, title }) => {

    const { data, isLoading, isError, error } = useAnalysisListQuery(activityId);

    const bubbles: BubbleRecord[] = (data ?? []).map(mapAnalysisResponseToBubbleRecord);

    const { activeBubble, activeBubbleId, setActiveBubbleId } = useBubbleSelection(bubbles);
    const layerQuery = useBubbleLayerQuery(activeBubble);
    

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
                        data={layerQuery.data}
                        isLoading={isLoading}
                        isError={isError}
                        error={error}
                    />
                </section>
            </div>
        </main>
    );
};

export default Bubbly;