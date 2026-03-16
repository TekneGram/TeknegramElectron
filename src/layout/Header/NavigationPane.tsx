import type { MainViewRoute } from "../MainView/mainViewRoute";
import ProjectsIcon from "./ProjectsIcon";
import SettingsIcon from "./SettingsIcon";

interface NavigationPaneProps {
    currentRoute: MainViewRoute;
    hasProjects: boolean;
    onNavigateProjects: () => void;
    onNavigateSettings: () => void;
}

const NavigationPane: React.FC<NavigationPaneProps> = ({
    currentRoute,
    hasProjects,
    onNavigateProjects,
    onNavigateSettings,
}) => {
    return (
        <nav className="header-navigation-pane" aria-label="Main view navigation">
            <button
                type="button"
                className={`header-navigation-button ${currentRoute === "projects" ? "is-active" : ""}`}
                onClick={onNavigateProjects}
                disabled={!hasProjects}
                aria-pressed={currentRoute === "projects"}
                aria-label={hasProjects ? "Show projects view" : "Projects view unavailable"}
                title={hasProjects ? "Projects" : "Projects unavailable"}
            >
                <ProjectsIcon />
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
