
import type { AnalysisFormType } from "@/layout/MainView/AnalysisView";
import InspectMetadataForm from "./displayForms/InspectMetadataForm";
import SampleCorpusForm from "./displayForms/sampleCorpusForm";
import RunExperimentForm from "./displayForms/runExperimentForm";

interface AnalysisDisplayProps {
    analysisFormType: AnalysisFormType
    onStopShowing: () => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysisFormType, onStopShowing }) => {



    function renderAnalysisForm() {
        switch (analysisFormType) {
            case "Inspect":
                return <InspectMetadataForm onStopShowing={onStopShowing} />
            case "Sampler":
                return <SampleCorpusForm onStopShowing={onStopShowing} />
            case "Run":
                return <RunExperimentForm onStopShowing={onStopShowing} />
            default:
                return null;
        }
    }

    return (
        <section className="analysis-display">
            {renderAnalysisForm()}
        </section>
    );
};

export default AnalysisDisplay;