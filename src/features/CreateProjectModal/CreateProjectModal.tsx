import './createProjectModal.css';
import '@/styles/button-styles.css';
import '@/styles/forms.css';
import '@/styles/shells.css';
import '@/styles/tool-tip.css';
import useCreateProjectForm from './hooks/useCreateProjectForm';
//import useCreateProjectMutation from './hooks/useCreateProjectMutation';
import useCreateProjectFlow from './hooks/useCreateProjectFlow';
import usePickCorpusFolder from './hooks/usePickCorpusFolder';
import usePickSemanticsRulesFile from './hooks/usePickSemanticsRulesFile';
import CorpusFolderPicker from './CorpusFolderPicker';
import SemanticsRulesPicker from './SemanticsRulesPicker';
import ProcessingOverlay from './ProcessingOverlay';
import { useEffect, useState } from 'react';

interface CreateProjectModalProps {
    onClose: () => void;
    onSuccessfulCreation: () => void;
}
const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSuccessfulCreation }) => {

    const { values, setters, resetForm, canSubmit } = useCreateProjectForm();
    const {
        projectName,
        corpusName,
        folderPath,
        semanticsRulesPath,
        compress,
        emitNgramPositions,
    } = values;
    const {
        setProjectName,
        setCorpusName,
        setFolderPath,
        setSemanticsRulesPath,
        setCompress,
        setEmitNgramPositions,
    } = setters;

    const { 
        submitCreateProject, 
        cancelCreateProject,
        wasCancelled,
        isPending,
        isSuccess,
        isError,
        error,
        progressMessage,
        percent
    } = useCreateProjectFlow()
    
    const { pickFolder, isPicking, setIsPicking } = usePickCorpusFolder();
    const { pickSemanticsRules, isPickingSemanticsRules, setIsPickingSemanticsRules } = usePickSemanticsRulesFile();
    
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    function handleSubmit() {
        if (!canSubmit) {
            return;
        }

        const request = {
            projectName: projectName.trim(),
            corpusName: corpusName.trim(),
            folderPath: folderPath.trim(),
            semanticsRulesPath: semanticsRulesPath.trim() ? semanticsRulesPath.trim() : undefined,
            postingFormat: compress ? "compressed" as const : "raw" as const,
            emitNgramPositions,
        }

        submitCreateProject(request);
    }

    // watch isSuccess
    useEffect(() => {
        if(!isSuccess) return;

        onSuccessfulCreation();
        resetForm();
        onClose();
    }, [isSuccess, wasCancelled, onSuccessfulCreation, resetForm, onClose]);

    // watch isError
    useEffect(() => {
        if(wasCancelled || !isError) {
            setErrorMessage(null);
            return;
        }
        setErrorMessage(`There was an error creating the project: ${error?.message}`);
    }, [isError, wasCancelled, setErrorMessage, error]);

    return(
        <div className="create-project-modal-backdrop" onClick={handleRequestClose}>
            <div 
                className="create-project-modal-panel shell-panel shell-surface-solid shell-radius-5xl shell-shadow-lg shell-highlight"
                onClick={(event) => event.stopPropagation()}
            >
                {
                    isPending ? (
                        <ProcessingOverlay
                            updateMessage={progressMessage}
                            percent={percent}
                            cancel={() => cancelCreateProject()}
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
                        className="create-project-modal-close button-secondary button-size-compact"
                        onClick={() => {handleRequestClose()}}
                        aria-label="Close create project modal"
                        disabled = {isPending}
                    >
                        Close
                    </button>
                </div>
                <div className="create-project-modal-body">
                    <div className="project-name-field">
                        <label className="create-project-field-label form-label" htmlFor="project-name">
                            Project Name
                        </label>
                        <input
                            id="project-name"
                            className="create-project-text-input form-control"
                            type = "text"
                            placeholder="Example: Academic Writing Project"
                            value = {projectName}
                            onChange = {(e) => setProjectName(e.target.value)}
                            disabled={isPending}
                        />    
                    </div>
                    <div className="corpus-name-field">
                        <label className="create-project-field-label form-label" htmlFor="corpus-name">
                            Corpus Name
                        </label>
                        <input
                            id="corpus-name"
                            className="create-project-text-input form-control"
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
                    <div className="create-project-options" aria-label="Corpus build options">
                        <div className="create-project-option-row">
                            <input
                                id="create-project-compress"
                                className="create-project-option-checkbox"
                                type="checkbox"
                                checked={compress}
                                onChange={(event) => setCompress(event.target.checked)}
                                disabled={isPending}
                            />
                            <div className="create-project-option-tooltip tooltip-anchor">
                                <label
                                    className="create-project-option-label create-project-option-tooltip-trigger tooltip-trigger"
                                    htmlFor="create-project-compress"
                                >
                                    Compress
                                </label>
                                <div className="create-project-option-tooltip-content tooltip-panel tooltip-panel-top-left tooltip-panel-compact" role="tooltip">
                                    Saves disk space but may slow lookups.
                                </div>
                            </div>
                        </div>
                        <div className="create-project-option-row">
                            <input
                                id="create-project-ngram-positions"
                                className="create-project-option-checkbox"
                                type="checkbox"
                                checked={emitNgramPositions}
                                onChange={(event) => setEmitNgramPositions(event.target.checked)}
                                disabled={isPending}
                            />
                            <div className="create-project-option-tooltip tooltip-anchor">
                                <label
                                    className="create-project-option-label create-project-option-tooltip-trigger tooltip-trigger"
                                    htmlFor="create-project-ngram-positions"
                                >
                                    Emit n-gram positions
                                </label>
                                <div className="create-project-option-tooltip-content tooltip-panel tooltip-panel-top-left tooltip-panel-compact" role="tooltip">
                                    Takes longer to build and uses more space, but makes n-gram lookup extremely fast.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="create-project-modal-footer">
                    <button
                        type="button"
                        className="button-secondary button-size-md"
                        onClick={() => {resetForm()}}
                        aria-label="Close create project modal"
                        disabled={isPending}
                    >
                        Reset form
                    </button>
                    <button
                        type="button"
                        className="button-primary button-size-md"
                        onClick={handleSubmit}
                        disabled={!canSubmit || isPending}
                        aria-label="create project"
                    >
                        Create
                    </button>
                </div>
                {
                    isError && !wasCancelled ? (
                        <div className="create-project-error-message">
                            <p>{errorMessage}</p>
                        </div>
                    ) : (<></>)
                }
                
                
            </div>
        </div>
    );
};

export default CreateProjectModal;
