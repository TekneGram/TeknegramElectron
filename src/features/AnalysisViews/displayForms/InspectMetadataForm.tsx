import { AnalysisType } from "@/app/ports/analysis.ports";

interface InspectMetadataProps {
    onStopShowing: () => void;
    onSubmitInspection: (analysisType: AnalysisType, config: string | null) => void | Promise<void>
}
const InspectMetadataForm: React.FC<InspectMetadataProps> = ({ onStopShowing, onSubmitInspection }) => {

    const goBack = () => {
        onStopShowing()
    }

    return (
        <>
            <h1>Inspect metadata</h1>
            <button
                onClick={goBack}
            >
                Back
            </button>
            <button
                onClick={() => onSubmitInspection("metadata_inspection", null)}
            >
                Create
            </button>
        </>
    );
};

export default InspectMetadataForm;