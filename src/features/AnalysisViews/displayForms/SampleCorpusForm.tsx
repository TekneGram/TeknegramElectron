
interface SampleCorpusFormProps {
    onStopShowing: () => void;
}
const SampleCorpusForm: React.FC<SampleCorpusFormProps> = ({ onStopShowing }) => {

    const goBack = () => {
        onStopShowing();
    }

    return (
        <>
            <h1>Sample Corpus</h1>
            <button
                onClick={goBack}
            >
                Go back
            </button>
        </>
    );
};

export default SampleCorpusForm;