
import { useNavigation } from "@/app/providers/useNavigation";
import ActivitiesControls from "./ActivitiesControls";

const ControlPanel = () => {
    const { navigationState } = useNavigation();

    function renderContent() {
        switch(navigationState.kind) {
            case "activities":
                return <ActivitiesControls />
        }
    }

    const content = renderContent();

    return (
        <>{content}</>
    );
};

export default ControlPanel;