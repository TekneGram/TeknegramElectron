
import type { AnalysisFormType } from "@/layout/MainView/AnalysisView";
import type { ActivityDetails, ActivityParentContext } from "@/app/ports/activities.ports";
import type { AnalysisCorpusMetadataResponse, AnalysisType, CreateAnalysisRequest } from "@/app/ports/analysis.ports";

import InspectMetadataForm from "./displayForms/InspectMetadataForm";
import SampleCorpusForm from "./displayForms/SampleCorpusForm";
import RunExperimentForm from "./displayForms/RunExperimentForm";

import { useCreateMetadataInspectionMutation } from "./hooks/useCreateMetadataInspectionMutation";


interface AnalysisDisplayProps {
    analysisFormType: AnalysisFormType
    activityParentContext: ActivityParentContext;
    activityDetails: ActivityDetails;
    onStopShowing: () => void;
    onAnalysisCreated: (result: AnalysisCorpusMetadataResponse) => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ 
    analysisFormType, 
    activityParentContext,
    activityDetails,
    onStopShowing,
    onAnalysisCreated
}) => {

    const { mutateAsync: submitMetadataInspection, isPending } = 
        useCreateMetadataInspectionMutation({
            activityId: activityDetails.activityId,
            onSuccess: (result) => {
                onAnalysisCreated(result);
                onStopShowing();
            }
    });


    const handleDoInspection = async (analysisType: AnalysisType, config: string | null) => {
        const request: CreateAnalysisRequest = {
            corpusId: activityParentContext.corpusId,
            activityId: activityDetails.activityId,
            analysisType: analysisType,
            config: config,
        }

        await submitMetadataInspection(request);
    }

    function renderAnalysisForm() {
        switch (analysisFormType) {
            case "Inspect":
                return <InspectMetadataForm 
                            onStopShowing={onStopShowing} 
                            onSubmitInspection={handleDoInspection}
                            isSubmitting={isPending}
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