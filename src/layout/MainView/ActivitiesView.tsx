import { useNavigation } from "@/app/providers/useNavigation";
import ActivityCard from "@/features/ActivityCard/ActivityCard";
import { useActivitiesQuery } from "@/features/Activities/hooks/useActivitiesQuery";
import { useCreateActivityMutation } from "@/features/Activities/hooks/useCreateActivityMutation";
import ActivitiesLoadingTransition from "./ActivitiesLoadingTransition";
import "./ActivitiesView.css";
import ExploreActivitiesIcon from "./icons/ExploreActivitiesIcon";
import LexicalBundlesActivitiesIcon from "./icons/LexicalBundlesActivitiesIcon";

const DEFAULT_ACTIVITY_TYPE = "lb_activities";

const ActivitiesView = () => {
    const { navigationState, dispatch } = useNavigation();

    if (navigationState.kind !== "activities") {
        return null;
    }

    const { projectId, projectName } = navigationState;
    const activitiesQuery = useActivitiesQuery({
        projectId,
        activityType: DEFAULT_ACTIVITY_TYPE,
    });
    const createActivityMutation = useCreateActivityMutation();
    const activities = activitiesQuery.data?.activities ?? [];
    const isBusy = activitiesQuery.isLoading || createActivityMutation.isPending;

    function handleStartExploreActivity() {
        // Reserved for the future exploration activity flow.
    }

    async function handleStartLexicalBundlesActivity() {
        if (isBusy) {
            return;
        }

        try {
            const response = await createActivityMutation.mutateAsync({
                projectId,
                activityType: DEFAULT_ACTIVITY_TYPE,
                requestType: "create",
            });

            const createdActivity = response.activities.at(-1);

            if (!createdActivity) {
                return;
            }

            dispatch({
                type: "open-analysis",
                projectId: response.projectId,
                activityId: createdActivity.activityId,
                activityType: createdActivity.activityType,
            });
        } catch {
            return;
        }
    }

    if (isBusy) {
        return <ActivitiesLoadingTransition />;
    }

    if (activities.length === 0) {
        return (
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
                                onClick={handleStartExploreActivity}
                            >
                                Start Activities
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
                                onClick={() => { void handleStartLexicalBundlesActivity(); }}
                            >
                                Start Lexical Bundles
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="activities-screen main-view-grid-surface">
            <header className="activities-screen-header">
                <p className="activities-screen-eyebrow">Corpus Activities</p>
                <h1>{activitiesQuery.data?.corpusName ?? projectName}</h1>
                <p className="activities-screen-intro">
                    {activities.length} {activities.length === 1 ? "activity" : "activities"} are ready for this corpus.
                </p>
                <div className="welcome-actions">
                    <button
                        type="button"
                        className="main-view-welcome-button"
                        onClick={() => { void handleStartLexicalBundlesActivity(); }}
                    >
                        Start Lexical Bundles
                    </button>
                </div>
            </header>
            <div className="activities-grid">
                {activities.map((activity) => (
                    <ActivityCard
                        key={activity.activityId}
                        activityName={activity.activityName}
                        activityTypeDisplayName={activity.activityTypeDisplayName}
                        description={activity.description}
                    />
                ))}
            </div>
        </section>
    );
};

export default ActivitiesView;
