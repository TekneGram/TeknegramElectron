import { type ReactNode, useState, useEffect } from 'react';
import type { ThemePreference, ResolvedTheme } from "@/app/types/theme";
import { ThemeContext, type ThemeContextValue } from './theme-context';


function getSystemTheme(): ResolvedTheme {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return "light";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {

    const [themePreference, setThemePreference] = useState<ThemePreference>("system");

    const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme())

    useEffect(() => {

        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        function handleChange(event: MediaQueryListEvent) {
            setSystemTheme(event.matches ? "dark" : "light")
        }

        setSystemTheme(mediaQuery.matches ? "dark" : "light");
        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        }
    }, []);

    const resolvedTheme: ResolvedTheme = themePreference === "system" ? systemTheme : themePreference;

    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }

        const root = document.documentElement;
        root.dataset.theme = resolvedTheme;
        root.style.colorScheme = resolvedTheme;
    }, [resolvedTheme]);

    function setTheme(theme: ThemePreference) {
        setThemePreference(theme);
    }

    const value: ThemeContextValue = {
        themePreference,
        resolvedTheme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value = {value}>
            {children}
        </ThemeContext.Provider>
    );
}