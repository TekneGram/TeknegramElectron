import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ActivityType } from "@/app/ports/activities.ports";
import { useNavigation } from './useNavigation';
import { ActivityStartContext, type ActivityStartContextValue } from "./activity-start-context";
import type { ActivityStartState } from './activity-start-state';
import { useCreateActivityMutation } from '@/features/Activities/hooks/useCreateActivityMutation';

const TRANSITION_MS = 3000;

const initialState: ActivityStartState = {
    phase: "idle",
    projectId: null,
    projectName: null,
    pendingActivityType: null,
    transitionActivityType: null,
};

interface ActivityStartProviderProps {
    children: ReactNode;
}

export function ActivityStartProvider({ children }: ActivityStartProviderProps) {
    const { navigationState, dispatch } = useNavigation();
    const createActivityMutation = useCreateActivityMutation();
    const [state, setState] = useState<ActivityStartState>(initialState);
    const timeoutRef = useRef<number | null>(null);

    function cancelPendingAnalysisNavigation() {
        if(timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setState(initialState);
    }

    function openStartModal(args: {
        projectId: string;
        projectName: string;
        activityType: ActivityType;
    }) {
        if (state.phase === "creating" || state.phase === "transitioning") {
            return;
        }

        setState({
            phase: "confirming",
            projectId: args.projectId,
            projectName: args.projectName,
            pendingActivityType: args.activityType,
            transitionActivityType: null,
        });
    }

    function closeStartModal() {
        if (state.phase === "creating" || state.phase === "transitioning") {
            return;
        }

        setState((current) => ({
            ...current,
            phase: "idle",
            pendingActivityType: null,
            transitionActivityType: null,
        }));
    }

    async function confirmStartActivity() {
        if (!state.projectId || !state.pendingActivityType) {
            return;
        }

        setState((current) => ({
            ...current,
            phase: "creating",
        }));

        try {
            const response = await createActivityMutation.mutateAsync({
                projectId: state.projectId,
                activityType: state.pendingActivityType
            });

            const createdActivity = response.activities.at(-1);

            if (!createdActivity) {
                setState(initialState);
                return;
            }

            setState((current) => ({
                ...current,
                phase: "transitioning",
                pendingActivityType: null,
                transitionActivityType: createdActivity.activityType,
            }));

            timeoutRef.current = window.setTimeout(() => {
                dispatch({
                    type: "open-analysis",
                    projectId: response.projectId,
                    activityId: createdActivity.activityId,
                    activityType: createdActivity.activityType
                });

                setState(initialState);
            }, TRANSITION_MS);
        } catch {
            setState((current) => ({
                ...current,
                phase: "confirming"
            }));
        }
    }

    useEffect(() => {
        return () =>  {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        }
    }, []);

    useEffect(() => {
        if (state.phase !== "transitioning" || !state.projectId) {
            return;
        }

        const stillOnSameActivitiesPage = 
            navigationState.kind === "activities" && 
            navigationState.projectId === state.projectId;
        
            if (!stillOnSameActivitiesPage) {
                cancelPendingAnalysisNavigation();
            }
    }, [navigationState, state.phase, state.projectId]);

    const value: ActivityStartContextValue = {
        state,
        openStartModal,
        closeStartModal,
        confirmStartActivity,
    };

    return <ActivityStartContext.Provider value={value}>
        {children}
    </ActivityStartContext.Provider>
}