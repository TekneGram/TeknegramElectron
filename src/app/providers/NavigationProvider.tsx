import { type ReactNode, useReducer } from 'react';
import { NavigationContext, type NavigationContextValue } from './navigation-context';
import { initialNavigationState, navigationReducer } from './navigation-state';

interface NavigationProviderProps {
    children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {

    const [navigationState, dispatch] = useReducer(
        navigationReducer,
        initialNavigationState,
    );

    const value: NavigationContextValue = {
        navigationState,
        dispatch,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    )

    
}