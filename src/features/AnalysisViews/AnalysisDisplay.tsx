
import type { AnalysisFormType } from "@/layout/MainView/AnalysisView";
import type { AnalysisType } from "@/app/ports/analysis.ports";

import InspectMetadataForm from "./displayForms/InspectMetadataForm";
import SampleCorpusForm from "./displayForms/SampleCorpusForm";
import RunExperimentForm from "./displayForms/RunExperimentForm";

interface AnalysisDisplayProps {
    analysisFormType: AnalysisFormType
    onStopShowing: () => void;
    onAnalysisRequest: (analysisType: AnalysisType, config: string | null) => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
    analysisFormType,
    onStopShowing,
    onAnalysisRequest
}) => {

    


    const handleAnalysisRequest = async (analysisType: AnalysisType, config: string | null) => {
        onAnalysisRequest(analysisType, config);
    }

    function renderAnalysisForm() {
        switch (analysisFormType) {
            case "Inspect":
                return <InspectMetadataForm 
                            onStopShowing={onStopShowing} 
                            onSubmitInspection={handleAnalysisRequest}
                        />
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