import ThemeToggle from '@/features/ThemeToggle/ThemeToggle';
import ProjectsTinyView from '@/features/ProjectsTinyView/ProjectsTinyView';
import '@/styles/layout.css';

interface HeaderProps {
    onOpenModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenModal }) => {
    return (
        <section className="header-bar">
            <div className="header-title">
                <ProjectsTinyView 
                    onOpenModal={onOpenModal}
                />
            </div>
            <div className="header-actions">
                <ThemeToggle />
            </div>
        </section>
    );
};

export default Header;
