import ProjectCardCancelIcon from "./ProjectCardCancelIcon";
import ProjectCardConfirmIcon from "./ProjectCardConfirmIcon";
import "@/styles/forms.css";

type ProjectCardTitleEditorProps = {
    projectName: string;
    draftName: string;
    isEditing: boolean;
    isSaving: boolean;
    canConfirm: boolean;
    error: Error | null;
    onStartEditing: () => void;
    onCancelEditing: () => void;
    onConfirmEditing: () => Promise<void>;
    onDraftNameChange: (value: string) => void;
};

const ProjectCardTitleEditor: React.FC<ProjectCardTitleEditorProps> = ({
    projectName,
    draftName,
    isEditing,
    isSaving,
    canConfirm,
    error,
    onStartEditing,
    onCancelEditing,
    onConfirmEditing,
    onDraftNameChange,
}) => {
    if (!isEditing) {
        return (
            <h2 className="project-card-title-heading">
                <button
                    type="button"
                    className="project-card-title-button"
                    onClick={onStartEditing}
                >
                    {projectName}
                </button>
            </h2>
        );
    }

    return (
        <div className="project-card-title-editor">
            <input
                autoFocus
                type="text"
                className="project-card-title-input form-control"
                value={draftName}
                onChange={(event) => onDraftNameChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        onCancelEditing();
                    }

                    if (event.key === "Enter" && canConfirm) {
                        event.preventDefault();
                        void onConfirmEditing();
                    }
                }}
                aria-label={`Edit project name for ${projectName}`}
                disabled={isSaving}
            />
            <div className="project-card-title-actions">
                <button
                    type="button"
                    className="project-card-title-icon-button project-card-title-icon-button-cancel"
                    onClick={onCancelEditing}
                    aria-label="Cancel project name edit"
                >
                    <ProjectCardCancelIcon />
                </button>
                <button
                    type="button"
                    className="project-card-title-icon-button button-primary button-icon"
                    onClick={() => {
                        void onConfirmEditing();
                    }}
                    aria-label="Confirm project name edit"
                    disabled={!canConfirm}
                >
                    <ProjectCardConfirmIcon />
                </button>
            </div>
            {
                error ? (
                    <p className="project-card-title-error">{error.message}</p>
                ) : null
            }
        </div>
    );
};

export default ProjectCardTitleEditor;
