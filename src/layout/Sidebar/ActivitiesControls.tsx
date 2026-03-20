import CreateLBButton from "./buttons/CreateLBButton";
import CreateExploreActivityButton from "./buttons/CreateExploreActivityButton";
import { useActivityStart } from "@/app/providers/useActivityStart";
import { useNavigation } from "@/app/providers/useNavigation";

const ActivitiesControls = () => {

    const { navigationState} = useNavigation();
    const { openStartModal } = useActivityStart();

    if (navigationState.kind !== "activities") {
        return null;
    }

    const { projectId, projectName } = navigationState;

    
    function startNewExplorationActivity() {
        openStartModal({
            projectId,
            projectName,
            activityType: "explore_activities"
        });
    }

    function startNewLexicalBundleActivity() {
        openStartModal({
            projectId,
            projectName,
            activityType: "lb_activities"
        })
    }

    return (
        <>
            <CreateExploreActivityButton onClickCreate={startNewExplorationActivity} />
            <CreateLBButton onClickCreate={startNewLexicalBundleActivity} />
        </>
    );
};

export default ActivitiesControls;