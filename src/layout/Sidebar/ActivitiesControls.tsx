import CreateLBButton from "./buttons/CreateLBButton";
import CreateExploreActivityButton from "./buttons/CreateExploreActivityButton";

const ActivitiesControls = () => {
    
    function startNewExplorationActivity() {
        // temporary placeholders
    }

    function startNewLexicalBundleActivity() {
        // temporary placeholders
    }

    return (
        <>
            <CreateExploreActivityButton onClickCreate={startNewExplorationActivity} />
            <CreateLBButton onClickCreate={startNewLexicalBundleActivity} />
        </>
    );
};

export default ActivitiesControls;