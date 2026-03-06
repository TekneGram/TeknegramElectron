import { createContext } from "react";
import type { ThemePreference, ResolvedTheme } from "@/app/types/theme";

export type ThemeContextValue = {
    themePreference: ThemePreference;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);