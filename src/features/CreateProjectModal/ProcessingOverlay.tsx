
import "./processingOverlay.css";
import "@/styles/button-styles.css";
import "@/styles/loading.css";
import "@/styles/shells.css";

interface ProcessingOverlayProps {
    updateMessage?: string;
    percent?: number;
    cancel: () => void;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ updateMessage, percent, cancel }) => {

        return (
            <div className="create-project-processing-overlay">
                <div className="create-project-processing-card shell-panel shell-radius-4xl shell-surface-card shell-shadow-md">
                    <div className="create-project-processing-spinner loading-spinner loading-spinner-lg" aria-hidden="true" />
                    <h3 className="create-project-processing-title">Building Corpus</h3>
                    <p className="create-project-processing-copy">
                        Processing your corpus files. Go grab yourself something nice.
                    </p>
                    {updateMessage ? (
                        <p className="create-project-processing-update">{updateMessage}</p>
                    ) : null}
                    {percent !== undefined ? (
                        <p className="create-project-processing-percent">{percent}%</p>
                    ) : null}
                </div>
                <div className="create-project-cancel-area">
                    <button
                        onClick={cancel}
                        type="button"
                        className="button-secondary button-size-md"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
};

export default ProcessingOverlay;
