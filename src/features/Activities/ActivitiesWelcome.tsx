import ExploreActivitiesIcon from "./icons/ExploreActivitiesIcon";
import LexicalBundlesActivitiesIcon from "./icons/LexicalBundlesActivitiesIcon";
import ActivitiesStartModal from "./ActivitiesStartModal";
import { useActivityStart } from "@/app/providers/useActivityStart";

interface ActivitiesWelcomeProps {
    projectName: string;
    projectId: string;
}

const ActivitiesWelcome: React.FC<ActivitiesWelcomeProps> = ({ projectName, projectId }) => {

    const {
        state,
        openStartModal,
        closeStartModal,
        confirmStartActivity
    } = useActivityStart();

    const isModalOpen = state.phase === "confirming" || state.phase === "creating";
    const isSubmitting = state.phase === "creating";

    return(
        <section className="main-view-activities-empty main-view-grid-surface">
            <div className="main-view-activities-empty-grid">
                <div className="main-view-activities-card">
                    <div className="main-view-activities-copy">
                        <div className="title">
                            <h1>Exploration Activities</h1>
                        </div>
                        <div className="welcome-message">
                            <p>Explore and analyze your corpus in depth with these activities in <strong>{projectName}</strong></p>
                        </div>
                    </div>
                    <div className="logo-area">
                        <div className="main-view-brand-icon-shell main-view-brand-icon-shell-welcome" aria-hidden="true">
                            <div className="main-view-brand-icon-ring" />
                            <div className="main-view-brand-icon-core main-view-brand-icon-core-welcome">
                                <ExploreActivitiesIcon />
                            </div>
                        </div>
                    </div>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="main-view-welcome-button"
                            onClick={() => openStartModal({
                                projectId,
                                projectName,
                                activityType: "explore_activities"
                            })}
                        >
                            Create Activity
                        </button>
                    </div>
                </div>

                <div className="main-view-activities-card">
                    <div className="main-view-activities-copy">
                        <div className="title">
                            <h1>Lexical Bundles</h1>
                        </div>
                        <div className="welcome-message">
                            <p>Use scientific computing techniques to extract lexical bundles from <strong>{projectName}</strong></p>
                        </div>
                    </div>
                    <div className="logo-area">
                        <div className="main-view-brand-icon-shell main-view-brand-icon-shell-welcome" aria-hidden="true">
                            <div className="main-view-brand-icon-ring" />
                            <div className="main-view-brand-icon-core main-view-brand-icon-core-welcome">
                                <LexicalBundlesActivitiesIcon />
                            </div>
                        </div>
                    </div>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="main-view-welcome-button"
                            onClick={() => openStartModal({
                                projectId,
                                projectName,
                                activityType: "lb_activities"
                            })}
                        >
                            Create Lexical Bundles
                        </button>
                    </div>
                </div>
            </div>
            <ActivitiesStartModal 
                isOpen={isModalOpen}
                pendingActivityType={state.pendingActivityType}
                projectName={projectName}
                isSubmitting={isSubmitting}
                onCancel={closeStartModal}
                onConfirm={confirmStartActivity}
            />
            
        </section>
    );
};

export default ActivitiesWelcome;