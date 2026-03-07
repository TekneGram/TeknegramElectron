import './CreateProjectModal.css';

interface CreateProjectModalProps {
    onClose: () => void;
}
const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {

    return(
        <div className="create-project-modal-backdrop" onClick={onClose}>
            <div 
                className="create-project-modal-panel"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="create-project-modal-header">
                    <div>
                        <h2 className="create-project-modal-title">Start New Project</h2>
                        <p className="create-project-modal-subtitle">
                            Build a corpus from a folder of source texts.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="create-project-modal-close"
                        onClick={onClose}
                        aria-label="Close create project modal"
                    >
                        Close
                    </button>
                </div>
                <div className="create-project-modal-body">
                    <div>Project name field</div>
                    <div>Corpus name field</div>
                    <div>Upload / folder for corpus selection area</div>
                    <div>Upload / file for semantic rules selection area</div>
                </div>
                
            </div>
        </div>
    );
};

export default CreateProjectModal;