import { bubbleRegistry } from "./registry/bubbleRegistry";
import type { BubbleLayerDataMap } from "./types/bubbleLayers";
import type { BubbleRecord } from "./types/bubble";

interface BubbleContainerProps {
    activeBubble: BubbleRecord;
    data: BubbleLayerDataMap[keyof BubbleLayerDataMap];
}

const BubbleContainer: React.FC<BubbleContainerProps> = ({ activeBubble, data }) => {

    const LayerComponent = bubbleRegistry[activeBubble.layerType].component;

    return (
        <section className="bubble-container">
            <div className="bubble-container-inner">
                <LayerComponent data={data}/>
            </div>
        </section>
    )
};

export default BubbleContainer;