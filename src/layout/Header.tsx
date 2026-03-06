import ThemeToggle from '@/features/ThemeToggle/ThemeToggle';
import '@/styles/layout.css';

const Header = () => {
    return (
        <section className="header-bar">
            <div className="header-title">
                <p>Header</p>
            </div>
            <div className="header-actions">
                <ThemeToggle />
            </div>
        </section>
    );
};

export default Header;
