import { useThemeContext } from "@/app/providers/useTheme";

const ThemeToggle = () => {
    const { themePreference, resolvedTheme, setTheme } = useThemeContext();

    function toggleTheme() {
        console.log(themePreference);
        if (resolvedTheme === "light") {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    }

    return (
        <>
            <div>
                <button
                    className = "theme-toggle"
                    onClick = {toggleTheme}
                >
                    Toggle
                </button>
            </div>
        </>
    );
};

export default ThemeToggle;