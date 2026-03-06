import { useThemeContext } from "@/app/providers/useTheme";

import "./ThemeToggle.css";

const ThemeToggle = () => {
    const { resolvedTheme, setTheme } = useThemeContext();

    function toggleTheme() {
        resolvedTheme === "light" ? setTheme("dark") : setTheme("light");
    }

    return (
        <>
            <button
                className = "theme-toggle"
                onClick = {toggleTheme}
                aria-label = "theme-toggle"
            >
                Toggle
            </button>
        </>
    );
};

export default ThemeToggle;