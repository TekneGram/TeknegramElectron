import ThemeToggle from '@/features/ThemeToggle/ThemeToggle';
import ProjectsTinyView from '@/features/ProjectsTinyView/ProjectsTinyView';
import NavigationPane from './Header/NavigationPane';
import '@/styles/layout.css';
import type { MainViewRoute } from './MainView/mainViewRoute';

interface HeaderProps {
    onOpenModal: () => void;
    currentRoute: MainViewRoute;
    hasProjects: boolean;
    onNavigateProjects: () => void;
    onNavigateSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({
    onOpenModal,
    currentRoute,
    hasProjects,
    onNavigateProjects,
    onNavigateSettings,
}) => {
    return (
        <section className="header-bar">
            <div className="header-title">
                <ProjectsTinyView 
                    onOpenModal={onOpenModal}
                />
            </div>
            <div className="header-actions">
                <NavigationPane
                    currentRoute={currentRoute}
                    hasProjects={hasProjects}
                    onNavigateProjects={onNavigateProjects}
                    onNavigateSettings={onNavigateSettings}
                />
                <ThemeToggle />
            </div>
        </section>
    );
};

export default Header;
