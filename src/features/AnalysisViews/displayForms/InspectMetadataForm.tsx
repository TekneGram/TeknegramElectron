import { AnalysisType } from "@/app/ports/analysis.ports";

interface InspectMetadataProps {
    onStopShowing: () => void;
    onSubmitInspection: (analysisType: AnalysisType, config: string | null) => void | Promise<void>
    isSubmitting: boolean;
}
const InspectMetadataForm: React.FC<InspectMetadataProps> = ({ onStopShowing, onSubmitInspection, isSubmitting }) => {

    const goBack = () => {
        onStopShowing()
    }

    return (
        <>
            <h1>Inspect metadata</h1>
            <button
                onClick={goBack}
                disabled={isSubmitting}
            >
                Back
            </button>
            <button
                onClick={() => onSubmitInspection("metadata_inspection", null)}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Creating..." : "Inspect"}
            </button>
        </>
    );
};

export default InspectMetadataForm;