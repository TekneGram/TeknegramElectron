import type { ProjectListItem } from "@/app/ports/projects.ports";
import { useDeleteProjectFlow } from "./hooks/useDeleteProjectFlow";
import { useProjectCorpusMetadata } from "./hooks/useProjectCorpusMetadata";
import { useProjectNameEditFlow } from "./hooks/useProjectNameEditFlow";
import ProjectCardTitleEditor from "./ProjectCardTitleEditor";
import "./projectCard.css";

type ProjectCardProps = {
    project: ProjectListItem;
    onNavigateToActivities: (projectId: string) => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onNavigateToActivities}) => {
    const {
        error: renameError,
        isEditing,
        isSaving,
        draftName,
        canConfirm,
        startEditing,
        cancelEditing,
        setDraftName,
        confirmEditing,
    } = useProjectNameEditFlow({
        projectUuid: project.uuid,
        projectName: project.projectName,
    });
    const {
        error,
        isConfirming,
        isDeleting,
        isConfirmed,
        isCollapsing,
        openConfirmation,
        cancelConfirmation,
        confirmDelete,
    } = useDeleteProjectFlow({ projectUuid: project.uuid });
    const {
        summary,
        isLoading: isCorpusMetadataLoading,
        isError: isCorpusMetadataError,
        progressMessage,
        percent,
    } = useProjectCorpusMetadata({ projectUuid: project.uuid });

    const shellClassName = [
        "project-card-shell",
        isCollapsing ? "project-card-shell-collapsing" : "",
    ].filter(Boolean).join(" ");

    return (
        <div className={shellClassName}>
            <div className="project-card">
                <div className="project-card-header">
                    <div className="project-card-badge">Ready</div>
                    <ProjectCardTitleEditor
                        projectName={project.projectName}
                        draftName={draftName}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        canConfirm={canConfirm}
                        error={renameError}
                        onStartEditing={startEditing}
                        onCancelEditing={cancelEditing}
                        onConfirmEditing={confirmEditing}
                        onDraftNameChange={setDraftName}
                    />
                </div>
                <div className="project-card-body">
                    <p className="project-card-copy">
                        {
                            isCorpusMetadataLoading
                                ? progressMessage
                                : isCorpusMetadataError
                                    ? "Corpus metadata summary is unavailable right now."
                                    : summary
                        }
                    </p>
                    {
                        isCorpusMetadataLoading ? (
                            <div className="project-card-metadata-progress" aria-live="polite">
                                <span className="project-card-metadata-spinner" aria-hidden="true" />
                                {
                                    percent !== undefined ? (
                                        <span className="project-card-metadata-percent">{percent}%</span>
                                    ) : null
                                }
                            </div>
                        ) : null
                    }
                </div>
                <div className="project-card-footer">
                    <div className="project-card-footer-divider" aria-hidden="true" />
                    <div className="project-card-actions">
                        <button
                            type="button"
                            className="project-card-delete-button"
                            onClick={openConfirmation}
                            disabled={isConfirming}
                        >
                            Delete
                        </button>
                        <button 
                            type="button" 
                            className="project-enter-button"
                            onClick={() => {onNavigateToActivities(project.uuid)}}
                        >
                            Enter Project
                        </button>
                    </div>
                </div>
            </div>
            {
                isConfirming ? (
                    <div className="project-card-modal" role="dialog" aria-modal="true" aria-label={`Delete ${project.projectName}`}>
                        <div className="project-card-modal-panel">
                            <p className="project-card-modal-eyebrow">Delete Project</p>
                            <h3>Delete {project.projectName}?</h3>
                            <p className="project-card-modal-copy">
                                This removes the project entry and its stored corpus binaries.
                            </p>
                            {
                                isDeleting ? (
                                    <div className="project-card-status-block">
                                        <p className="project-card-status">Deleting...</p>
                                        
                                    </div>
                                ) : isConfirmed ? (
                                    <>
                                        <p className="project-card-status">Delete confirmed</p>
                                        <div className="project-card-progress" aria-hidden="true">
                                            <span className="project-card-progress-bar" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="project-card-modal-actions">
                                        <button
                                            type="button"
                                            className="project-card-cancel-button"
                                            onClick={cancelConfirmation}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="project-card-confirm-button"
                                            onClick={() => { void confirmDelete(); }}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                )
                            }
                            {
                                error ? (
                                    <p className="project-card-error">{error.message}</p>
                                ) : null
                            }
                        </div>
                    </div>
                ) : null
            }
        </div>
    );
};

export default ProjectCard;
