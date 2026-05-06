import CreateLBButton from "./buttons/CreateLBButton";
import CreateVocabButton from "./buttons/CreateVocabButton";
import CreateCollocationButton from "./buttons/CreateCollocationButton";
import CreateDependencyButton from "./buttons/CreateDependencyButton";
import { useActivityStart } from "@/app/providers/useActivityStart";
import { useNavigation } from "@/app/providers/useNavigation";

const ActivitiesControls = () => {

    const { navigationState} = useNavigation();
    const { openStartModal } = useActivityStart();

    if (navigationState.kind !== "activities") {
        return null;
    }

    const { projectId, projectName } = navigationState;

    
    function startNewVocabActivity() {
        openStartModal({
            projectId,
            projectName,
            activityType: "vocab_activities",
        });
    }

    function startNewCollocationActivity() {
        openStartModal({
            projectId,
            projectName,
            activityType: "collocation_activities",
        });
    }

    function startNewDependencyActivity() {
        openStartModal({
            projectId,
            projectName,
            activityType: "dependency_activities",
        });
    }

    function startNewLexicalBundleActivity() {
        openStartModal({
            projectId,
            projectName,
            activityType: "lb_activities",
        });
    }

    return (
        <>
            <CreateVocabButton onClickCreate={startNewVocabActivity} />
            <CreateCollocationButton onClickCreate={startNewCollocationActivity} />
            <CreateDependencyButton onClickCreate={startNewDependencyActivity} />
            <CreateLBButton onClickCreate={startNewLexicalBundleActivity} />
        </>
    );
};

export default ActivitiesControls;
