import { useNavigation } from "@/app/providers/useNavigation";
import { useActivitiesQuery } from "@/layout/MainView/Activities/hooks/useActivitiesQuery";
import { useCreateActivityMutation } from "@/layout/MainView/Activities/hooks/useCreateActivityMutation";
import ActivitiesLoadingTransition from "./ActivitiesLoadingTransition";
import "./styles/ActivitiesView.css";
import ActivitiesWelcome from "@/layout/MainView/Activities/ActivitiesWelcome";
import Activities from "@/layout/MainView/Activities/Activities";

const DEFAULT_ACTIVITY_TYPE = "lb_activities";

const ActivitiesView = () => {
    const { navigationState, dispatch } = useNavigation();

    if (navigationState.kind !== "activities") {
        return null;
    }

    const { projectId, projectName } = navigationState;
    const activitiesQuery = useActivitiesQuery({
        projectId,
    });
    const createActivityMutation = useCreateActivityMutation();
    const activities = activitiesQuery.data?.activities ?? [];
    const corpusName = activitiesQuery.data?.corpusName ?? "Your corpus";
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
        <Activities 
            activities={activities}
            corpusName={corpusName}
        />
    );
};

export default ActivitiesView;
