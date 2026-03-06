import ThemeToggle from '@/features/ThemeToggle/ThemeToggle';
import '@/styles/layout.css';

const Header = () => {
    return (
        <section className="header-bar">
            <div>
                <p>Header</p>
                <ThemeToggle />
            </div>
        </section>
    );
};

export default Header;
