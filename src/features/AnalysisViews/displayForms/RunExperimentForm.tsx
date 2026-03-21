
interface RunExperimentFormProps {
    onStopShowing: () => void;
}

const RunExperimentForm: React.FC<RunExperimentFormProps> = ({ onStopShowing }) => {

    const goBack = () => {
        onStopShowing();
    }

    return (
        <>
            <h1>Run Experiment</h1>
            <button
                onClick={goBack}
            >
                Go back
            </button>
        </>
    );
};

export default RunExperimentForm;