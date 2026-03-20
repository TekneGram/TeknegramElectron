import type { BubbleRecord } from "./types/bubble";
import Bubble from "./Bubble";

interface BubbleWrapProps {
    bubbles: BubbleRecord[];
    activeBubbleId: string | null;
    onBubbleClick: (bubbleId: string) => void;
}

const BubbleWrap: React.FC<BubbleWrapProps> = ({ 
    bubbles,
    activeBubbleId,
    onBubbleClick
}) => {

    const handleBubbleClick = (bubbleId: string) => {

        onBubbleClick(bubbleId);
    }


    return (
        <section className="bubble-wrap" aria-label="Bubble order">
            <button
                className="bubble-wrap-control bubble-wrap-control-left"
                aria-label="Show earlier bubbles"
            >
                ←
            </button>
            <div
                className={`bubble-wrap-rail`}
            >
                <div className="bubble-wrap-arc">
                    {/* map over data to create <Bubble /> elements */}
                </div>
            </div>
            <button
                className="bubble-wrap-control bubble-wrap-control-right"
                aria-label="Show later bubbles"
            >
                →
            </button>
        </section>
    );
};

export default BubbleWrap;