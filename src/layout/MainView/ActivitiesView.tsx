import { useNavigation } from "@/app/providers/useNavigation";
import ActivityCard from "@/features/ActivityCard/ActivityCard";
import { useActivitiesQuery } from "@/layout/MainView/Activities/hooks/useActivitiesQuery";
import { useCreateActivityMutation } from "@/layout/MainView/Activities/hooks/useCreateActivityMutation";
import ActivitiesLoadingTransition from "./ActivitiesLoadingTransition";
import "./styles/ActivitiesView.css";
import ActivitiesWelcome from "@/layout/MainView/Activities/ActivitiesWelcome";

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
            <ActivitiesWelcome 
                onStartExploreActivity={handleStartExploreActivity}
                onStartLexicalBundlesActivity={handleStartLexicalBundlesActivity}
                projectName={projectName}
            />
        )
    }

    return (
        <section className="activities-screen main-view-grid-surface">
            <header className="activities-screen-header">
                <p className="activities-screen-eyebrow">Corpus Activities</p>
                <h1>{activitiesQuery.data?.corpusName ?? projectName}</h1>
                <p className="activities-screen-intro">
                    {activities.length} {activities.length === 1 ? "activity is" : "activities are"} set up for this corpus.
                </p>
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
