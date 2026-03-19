import { useNavigation } from "@/app/providers/useNavigation";
import HomeIcon from "./HomeIcon";
import SettingsIcon from "./SettingsIcon";

const NavigationPane = () => {

    const { navigationState, dispatch } = useNavigation();

    const handleNavigateHome = () => {
        dispatch({ type: "go-home" });
    }

    const handleNavigateSettings = () => {
        dispatch({ type: "go-settings" });
    }

    return (
        <nav className="header-navigation-pane" aria-label="Main view navigation">
            <button
                type="button"
                className={`header-navigation-button ${navigationState.kind === "home" ? "is-active" : ""}`}
                onClick={handleNavigateHome}
                aria-pressed={navigationState.kind === "home"}
                aria-label="Show home view"
                title="Home"
            >
                <HomeIcon />
            </button>

            <button
                type="button"
                className={`header-navigation-button ${navigationState.kind === "settings" ? "is-active" : ""}`}
                onClick={handleNavigateSettings}
                aria-pressed={navigationState.kind === "settings"}
                aria-label="Show settings view"
                title="Settings"
            >
                <SettingsIcon />
            </button>
        </nav>
    );
};

export default NavigationPane;
