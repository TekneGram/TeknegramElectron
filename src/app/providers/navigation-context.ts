import { createContext, type Dispatch } from "react";
import type { NavigationAction, NavigationState } from "./navigation-state";

export type NavigationContextValue = {
    navigationState: NavigationState;
    dispatch: Dispatch<NavigationAction>;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);