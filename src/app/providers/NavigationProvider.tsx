import { type ReactNode, useState, useEffect } from 'react';
import type { NavigationState } from './navigation-state';

export function NavigationProvider({ children }: { children: ReactNode }) {

    const [currentRoute, setCurrentRoute] = useState<NavigationState>({ kind: "home" });

    
}