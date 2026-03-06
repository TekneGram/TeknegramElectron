import { useThemeContext } from "@/app/providers/useTheme";
import SunIcon from "./SunIcon";
import MoonIcon from "./MoonIcon";

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
                {resolvedTheme === "light" ? <MoonIcon /> : <SunIcon /> }
            </button>
        </>
    );
};

export default ThemeToggle;