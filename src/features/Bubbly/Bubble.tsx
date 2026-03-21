import type { BubbleRecord } from "./types/bubble";

interface BubbleProps {
    bubble: BubbleRecord;
    isActive: boolean;
    position: {
        leftPx: number;
        topPx: number;
    };
    onClick: (bubbleId: string) => void;
}

const Bubble: React.FC<BubbleProps> = ({ bubble, isActive }) => {

    return(
        <button
            className={`bubble ${isActive ? 'bubble-active' : ''}`}
        >
            <span className="bubble-content">
                <span className="">{bubble.analysisName}</span>
                <span className="">{bubble.description}</span>
                <span className="">{bubble.displayName}</span>
            </span>

        </button>
    );
};

export default Bubble;