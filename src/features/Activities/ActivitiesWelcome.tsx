import ExploreActivitiesIcon from "./icons/ExploreActivitiesIcon";
import LexicalBundlesActivitiesIcon from "./icons/LexicalBundlesActivitiesIcon";
import { useStartActivityFlow } from "./hooks/useStartActivityFlow";
import ActivitiesStartModal from "./ActivitiesStartModal";
import ActivitiesStartTransition from "./ActivitiesStartTransition";

interface ActivitiesWelcomeProps {
    projectName: string;
    projectId: string;
}

const ActivitiesWelcome: React.FC<ActivitiesWelcomeProps> = ({ projectName, projectId }) => {

    const {
        pendingActivityType,
        isModalOpen,
        isSubmitting,
        isTransitioning,
        openStartModal,
        closeStartModal,
        confirmStartActivity,
    } = useStartActivityFlow({ projectId });

    if (isTransitioning) {
        return <ActivitiesStartTransition activityType={pendingActivityType} />
    }

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
                            onClick={() => openStartModal("explore_activities")}
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
                            onClick={() => openStartModal("lb_activities")}
                        >
                            Create Lexical Bundles
                        </button>
                    </div>
                </div>
            </div>
            <ActivitiesStartModal 
                isOpen={isModalOpen}
                pendingActivityType={pendingActivityType}
                projectName={projectName}
                isSubmitting={isSubmitting}
                onCancel={closeStartModal}
                onConfirm={confirmStartActivity}
            />
            
        </section>
    );
};

export default ActivitiesWelcome;