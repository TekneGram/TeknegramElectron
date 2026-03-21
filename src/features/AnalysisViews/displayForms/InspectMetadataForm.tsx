
interface InspectMetadataProps {
    onStopShowing: () => void;
}
const InspectMetadataForm: React.FC<InspectMetadataProps> = ({ onStopShowing }) => {

    const goBack = () => {
        onStopShowing()
    }

    return (
        <>
            <h1>Inspect metadata</h1>
            <button
                onClick={goBack}
            >Stop it</button>
        </>
    );
};

export default InspectMetadataForm;