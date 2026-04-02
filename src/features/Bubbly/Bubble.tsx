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

const Bubble: React.FC<BubbleProps> = ({ bubble, isActive, position, onClick }) => {

    return(
        <button
            className={`bubble ${isActive ? 'bubble-active' : ''}`}
            onClick={() => onClick(bubble.bubbleId)}
            style={{
                left: `${position.leftPx}px`,
                top: `${position.topPx}px`,
            }}
            type="button"
        >
            <span className="bubble-content">
                <span>{bubble.analysisName}</span>
                <span>{bubble.displayName}</span>
                <span>{bubble.description}</span>
            </span>

        </button>
    );
};

export default Bubble;
