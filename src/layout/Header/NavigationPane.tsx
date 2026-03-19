import type { MainViewRoute } from "../MainView/mainViewRoute";
import HomeIcon from "./HomeIcon";
import SettingsIcon from "./SettingsIcon";

interface NavigationPaneProps {
    currentRoute: MainViewRoute;
    onNavigateHome: () => void;
    onNavigateSettings: () => void;
}

const NavigationPane: React.FC<NavigationPaneProps> = ({
    currentRoute,
    onNavigateHome,
    onNavigateSettings,
}) => {
    return (
        <nav className="header-navigation-pane" aria-label="Main view navigation">
            <button
                type="button"
                className={`header-navigation-button ${currentRoute === "home" ? "is-active" : ""}`}
                onClick={onNavigateHome}
                aria-pressed={currentRoute === "home"}
                aria-label="Show home view"
                title="Home"
            >
                <HomeIcon />
            </button>

            <button
                type="button"
                className={`header-navigation-button ${currentRoute === "settings" ? "is-active" : ""}`}
                onClick={onNavigateSettings}
                aria-pressed={currentRoute === "settings"}
                aria-label="Show settings view"
                title="Settings"
            >
                <SettingsIcon />
            </button>
        </nav>
    );
};

export default NavigationPane;
