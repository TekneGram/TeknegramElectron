
interface InspectMetadataProps {
    onStopShowing: () => void;
    doInspection: () => void;
}
const InspectMetadataForm: React.FC<InspectMetadataProps> = ({ onStopShowing, doInspection }) => {

    const goBack = () => {
        onStopShowing()
    }

    return (
        <>
            <h1>Inspect metadata</h1>
            <button
                onClick={goBack}
            >Do it</button>
            <button
                onClick={doInspection}
            >
                Inspect
            </button>
        </>
    );
};

export default InspectMetadataForm;