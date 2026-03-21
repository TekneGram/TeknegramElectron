import type { BubbleRecord } from "./types/bubble";
import Bubble from "./Bubble";
import { useBubbleWrapScroll } from "./hooks/useBubbleWrapScroll";

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

    const {
        railRef,
        positions,
        isDragging,
        canMoveLeft,
        canMoveRight,
        moveLeft,
        moveRight,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel,
        onWheel,
        suppressClick,
    } = useBubbleWrapScroll(bubbles);

    const handleBubbleClick = (bubbleId: string) => {
        if (suppressClick) {
            return;
        }

        onBubbleClick(bubbleId);
    }


    return (
        <section className="bubble-wrap" aria-label="Bubble order">
            <button
                className="bubble-wrap-control bubble-wrap-control-left"
                aria-label="Show earlier bubbles"
                onClick={moveLeft}
                disabled={!canMoveLeft}
                type="button"
            >
                ←
            </button>
            <div
                className={`bubble-wrap-rail ${isDragging ? 'bubble-wrap-rail-dragging' : ''}`}
                onPointerCancel={onPointerCancel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onWheel={onWheel}
                ref={railRef}
            >
                <div className="bubble-wrap-arc">
                    {positions.map(({ bubble, leftPx, topPx}) => (
                        <Bubble 
                            bubble={bubble}
                            isActive={bubble.bubbleId === activeBubbleId}
                            key={bubble.bubbleId}
                            onClick={handleBubbleClick}
                            position={{ leftPx, topPx }}
                        />
                    ))}
                </div>
            </div>
            <button
                className="bubble-wrap-control bubble-wrap-control-right"
                aria-label="Show later bubbles"
                onClick={moveRight}
                disabled={!canMoveRight}
                type="button"
            >
                →
            </button>
        </section>
    );
};

export default BubbleWrap;