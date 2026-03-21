import { bubbleRegistry } from "./registry/bubbleRegistry";
import type { BubbleLayerDataMap } from "./types/bubbleLayers";
import type { BubbleRecord } from "./types/bubble";

interface BubbleContainerProps {
    activeBubble: BubbleRecord | null;
    data: BubbleLayerDataMap[keyof BubbleLayerDataMap] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
}

const BubbleContainer: React.FC<BubbleContainerProps> = ({ activeBubble, data, isLoading, isError, error }) => {

    if (!activeBubble) {
        return (
            <section className="bubble-container">
                <div className="bubble-container-inner bubble-container-state">
                    <div className="bubble-container__state-panel">
                        <h2 className="bubble-container__state-title">No Bubble Selected</h2>
                        <p>Select a bubble to render its layer.</p>
                    </div>
                </div>
            </section>
        );
    }

    if (isLoading) {
        return (
            <section className="bubble-container">
                <div className="bubble-container-inner bubble-container-state">
                    <div className="bubble-container-state-panel">
                        <h2 className="bubble-container-state-title">Loading Layer</h2>
                        <p>Fetching {activeBubble.analysisName} from the mock artifact store.</p>
                    </div>
                </div>
            </section>
        );
    }

    if (isError || !data) {
        return (
            <section className="bubble-container">
                <div className="bubble-container-inner bubble-container-state">
                        <div className="bubble-container-state-panel">
                        <h2 className="bubble-container-state-title">Layer Failed To Load</h2>
                        <p>{error?.message ?? 'No data was returned for the active bubble.'}</p>
                    </div>
                </div>
            </section>
        );
    }

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