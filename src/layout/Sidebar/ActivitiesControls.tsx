import CreateLBButton from "./buttons/CreateLBButton";
import CreateExploreActivityButton from "./buttons/CreateExploreActivityButton";
import { useActivityStart } from "@/app/providers/useActivityStart";
import { useNavigation } from "@/app/providers/useNavigation";
import ActivitiesStartModal from "@/features/Activities/ActivitiesStartModal";

const ActivitiesControls = () => {

    const { navigationState} = useNavigation();
    const { state, openStartModal, closeStartModal, confirmStartActivity } = useActivityStart();

    if (navigationState.kind !== "activities") {
        return null;
    }

    const { projectId, projectName } = navigationState;
    const isModalOpen = state.phase === "confirming" || state.phase === "creating";
    const isSubmitting = state.phase === "creating";

    
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

export default ActivitiesControls;