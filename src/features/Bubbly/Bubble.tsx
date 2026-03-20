import type { BubbleRecord } from "./types/bubble";

interface BubbleProps {
    bubble: BubbleRecord;
    isActive: boolean;
}

const Bubble: React.FC<BubbleProps> = ({ bubble, isActive }) => {

    return(
        <button
            className={`bubble ${isActive ? 'bubble-active' : ''}`}
        >
            <span className="bubble-content">
                
            </span>

        </button>
    );
};

export default Bubble;