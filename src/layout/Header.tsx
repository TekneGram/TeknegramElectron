import ThemeToggle from '@/features/ThemeToggle/ThemeToggle';
import ProjectsTinyView from '@/features/ProjectsTinyView/ProjectsTinyView';
import '@/styles/layout.css';

const Header = () => {
    return (
        <section className="header-bar">
            <div className="header-title">
                <ProjectsTinyView />
            </div>
            <div className="header-actions">
                <ThemeToggle />
            </div>
        </section>
    );
};

export default Header;
