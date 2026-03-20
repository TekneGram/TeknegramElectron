import { useRef, useState, useEffect } from 'react';
import type { ActivityType } from "@/app/ports/activities.ports";
import { useCreateActivityMutation } from './useCreateActivityMutation';
import { useNavigation } from '@/app/providers/useNavigation';

type PendingActivityType = ActivityType | null;

interface UseStartActivityFlowArgs {
    projectId: string;
}

const TRANSITION_MS = 3000;
type StartActivityPhase = "idle" | "confirming" | "creating" | "transitioning";

export function useStartActivityFlow({ projectId }: UseStartActivityFlowArgs) {
    const { dispatch } = useNavigation();
    const createActivityMutation = useCreateActivityMutation();
    const [pendingActivityType, setPendingActivityType] = useState<PendingActivityType>(null);
    const [phase, setPhase] = useState<StartActivityPhase>("idle");
    const timeoutRef = useRef<number | null>(null);

    

    function openStartModal(activityType: ActivityType) {
        if (phase === "creating" || phase === "transitioning") {
            return;
        }

        setPendingActivityType(activityType);
        setPhase("confirming");
    }

    function closeStartModal() {
        if (phase === "creating" || phase === "transitioning") {
            return;
        }

        setPendingActivityType(null);
        setPhase("idle");
    }

    async function confirmStartActivity() {
        if (!pendingActivityType) {
            return;
        }

        setPhase("creating");

        try {
            const response = await createActivityMutation.mutateAsync({
                projectId,
                activityType: pendingActivityType,
            });

            const createdActivity = response.activities.at(-1);

            if (!createdActivity) {
                setPendingActivityType(null);
                setPhase("idle");
                return;
            }

            setPendingActivityType(null);
            setPhase("transitioning");

            timeoutRef.current = window.setTimeout(() => {
                dispatch({
                    type: "open-analysis",
                    projectId: response.projectId,
                    activityId: createdActivity.activityId,
                    activityType: createdActivity.activityType
                });
            }, TRANSITION_MS);

            
        } catch {
            // service/mutation already handles user-facing errors
            setPhase("confirming");
        }
    }

    // cleanup on unmoun
    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        }
    })

    return {
        pendingActivityType,
        isModalOpen: phase === "confirming" || phase === "creating",
        isSubmitting: phase === "creating",
        isTransitioning: phase === "transitioning",
        openStartModal,
        closeStartModal,
        confirmStartActivity,
    };
}