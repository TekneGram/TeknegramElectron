import { useNavigation } from "@/app/providers/useNavigation";
import { useActivitiesQuery } from "@/features/Activities/hooks/useActivitiesQuery";
import "./styles/ActivitiesView.css";
import ActivitiesWelcome from "@/features/Activities/ActivitiesWelcome";
import Activities from "@/features/Activities/Activities";
import ActivitiesStartTransition from "@/features/Activities/ActivitiesStartTransition";
import ActivitiesLoadingTransition from "./ActivitiesLoadingTransition";
import { useActivityStart } from "@/app/providers/useActivityStart";
import ActivitiesStartModal from "@/features/Activities/ActivitiesStartModal";

const ActivitiesView = () => {
    const { navigationState } = useNavigation();
    const { state, closeStartModal, confirmStartActivity } = useActivityStart();
    const isModalOpen = state.phase === "confirming" || state.phase === "creating";
    const isSubmitting = state.phase === "creating";

    const isActivitiesView = navigationState.kind === "activities";
    const projectId = isActivitiesView ? navigationState.projectId : "";
    const projectName = isActivitiesView ? navigationState.projectName : "";

    const activitiesQuery = useActivitiesQuery(
        { projectId }
    );

    if (!isActivitiesView) {
        return null;
    }

    const activities = activitiesQuery.data?.activities ?? [];
    const corpusName = activitiesQuery.data?.corpusName ?? "Your corpus";

    if (state.phase === "transitioning") {
        return (
            <ActivitiesStartTransition activityType={state.transitionActivityType} />
        );
    }

    if (activitiesQuery.isLoading) {
        return <ActivitiesLoadingTransition />
    }

    if (activitiesQuery.isError) {
        return (
            <section className="activities-screen main-view-grid-surface">
                <header className="activities-screen-header">
                    <p className="activities-screen-eyebrow">Corpus Activities</p>
                    <h1>{projectName}</h1>
                    <p className="activities-screen-intro">
                        Teknegram could not load the activities for this project right now.
                    </p>
                    <div className="welcome-actions">
                        <button
                            type="button"
                            className="main-view-welcome-button"
                            onClick={() => {
                                void activitiesQuery.refetch();
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </header>
            </section>
        );
    }

    if (activities.length === 0) {
        return (
            <>
                <ActivitiesWelcome 
                    projectName={projectName}
                    projectId={projectId}
                />
                <ActivitiesStartModal 
                    isOpen={isModalOpen}
                    pendingActivityType={state.pendingActivityType}
                    projectName={projectName}
                    isSubmitting={isSubmitting}
                    onCancel={closeStartModal}
                    onConfirm={confirmStartActivity}
                />
            </>
            
        )
    }

    return (
        <>
            <Activities 
                activities={activities}
                corpusName={corpusName}
            />
            <ActivitiesStartModal 
                isOpen={isModalOpen}
                pendingActivityType={state.pendingActivityType}
                projectName={projectName}
                isSubmitting={isSubmitting}
                onCancel={closeStartModal}
                onConfirm={confirmStartActivity}
            />
        </>
        
    );
};

export default ActivitiesView;
