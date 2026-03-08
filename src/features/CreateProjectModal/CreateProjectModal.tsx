import './createProjectModal.css';
import useCreateProjectForm from './hooks/useCreateProjectForm';
import useCreateProjectMutation from './hooks/useCreateProjectMutation';
import usePickCorpusFolder from './hooks/usePickCorpusFolder';
import usePickSemanticsRulesFile from './hooks/usePickSemanticsRulesFile';
import CorpusFolderPicker from './CorpusFolderPicker';
import SemanticsRulesPicker from './SemanticsRulesPicker';
import ProcessingOverlay from './ProcessingOverlay';

interface CreateProjectModalProps {
    onClose: () => void;
}
const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {

    const { values, setters, resetForm, canSubmit } = useCreateProjectForm();
    const { projectName, corpusName, folderPath, semanticsRulesPath } = values;
    const { setProjectName, setCorpusName, setFolderPath, setSemanticsRulesPath } = setters;
    const { mutate, mutateAsync, isPending, isSuccess, isError, error } = useCreateProjectMutation();
    const { pickFolder, isPicking, setIsPicking } = usePickCorpusFolder();
    const { pickSemanticsRules, isPickingSemanticsRules, setIsPickingSemanticsRules } = usePickSemanticsRulesFile();

    async function handlePickCorpusFolder() {
        setIsPicking(true);
        try {
            const folderPath = await pickFolder();
            if(folderPath) {
                setters.setFolderPath(folderPath)
            }
        } finally {
            setIsPicking(false);
        }
    }

    async function handlePickSemanticsRules() {
        setIsPickingSemanticsRules(true);
        try {
            const filePath = await pickSemanticsRules();
            if(filePath) {
                setSemanticsRulesPath(filePath);
            }
        } finally {
            setIsPickingSemanticsRules(false);
        }
    }

    function handleRequestClose() {
        if (isPending) {
            return;
        }

        resetForm();
        onClose();
    }

    async function handleSubmit() {
        if (!canSubmit) {
            return;
        }

        const request = {
            projectName: projectName.trim(),
            corpusName: corpusName.trim(),
            folderPath: folderPath.trim(),
            semanticsRulesPath: semanticsRulesPath.trim() ? semanticsRulesPath.trim() : undefined,
        }

        await mutateAsync(request);
        resetForm();
        onClose();
    }

    return(
        <div className="create-project-modal-backdrop" onClick={handleRequestClose}>
            <div 
                className="create-project-modal-panel"
                onClick={(event) => event.stopPropagation()}
            >
                {
                    isPending ? (
                        <ProcessingOverlay
                            updateMessage={"Processing"}
                            percent={20}
                        />
                    ) : null
                }
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
                        onClick={() => {handleRequestClose()}}
                        aria-label="Close create project modal"
                        disabled = {isPending}
                    >
                        Close
                    </button>
                </div>
                <div className="create-project-modal-body">
                    <div className="project-name-field">
                        <label className="create-project-field-label" htmlFor="project-name">
                            Project Name
                        </label>
                        <input
                            id="project-name"
                            className="create-project-text-input"
                            type = "text"
                            placeholder="Example: Academic Writing Project"
                            value = {projectName}
                            onChange = {(e) => setProjectName(e.target.value)}
                            disabled={isPending}
                        />    
                    </div>
                    <div className="corpus-name-field">
                        <label className="create-project-field-label" htmlFor="corpus-name">
                            Corpus Name
                        </label>
                        <input
                            id="corpus-name"
                            className="create-project-text-input"
                            type = "text"
                            placeholder="Example: BAWE"
                            value = {corpusName}
                            onChange = {(e) => setCorpusName(e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <div className="corpus-folder-picker-area">
                        <CorpusFolderPicker 
                            onSetFolderPath={setFolderPath} 
                            onPickFolder={handlePickCorpusFolder}
                            isPicking={isPicking}
                            folderPath={folderPath}
                        />
                    </div>
                    <div className="semantics-rules-picker-area">
                        <SemanticsRulesPicker 
                            onSetSemanticsRulesPath={setSemanticsRulesPath}
                            onPickSemanticsRules={handlePickSemanticsRules}
                            isPickingSemanticsRules={isPickingSemanticsRules}
                            semanticsRulesPath={semanticsRulesPath}
                        />
                    </div>
                </div>
                <div className="create-project-modal-footer">
                    <button
                        type="button"
                        className="create-project-modal-reset"
                        onClick={() => {resetForm()}}
                        aria-label="Close create project modal"
                        disabled={isPending}
                    >
                        Reset form
                    </button>
                    <button
                        type="button"
                        className="create-project-modal-button"
                        onClick={handleSubmit}
                        disabled={!canSubmit || isPending}
                        aria-label="create project"
                    >
                        Create
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default CreateProjectModal;