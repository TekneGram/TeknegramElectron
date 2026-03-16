import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { projectsQueryKey } from "@/features/ProjectsTinyView/hooks/useProjectsQuery";
import { useDeleteProjectMutation } from "./useDeleteProjectMutation";

type DeleteProjectFlowOptions = {
    projectUuid: string;
};

type DeletePhase = "idle" | "confirming" | "deleting" | "confirmed" | "collapsing";

const CONFIRMED_MESSAGE_MS = 3000;
const COLLAPSE_MS = 520;

export function useDeleteProjectFlow({ projectUuid }: DeleteProjectFlowOptions) {
    const queryClient = useQueryClient();
    const mutation = useDeleteProjectMutation();
    const [phase, setPhase] = useState<DeletePhase>("idle");
    const confirmedTimeoutRef = useRef<number | null>(null);
    const collapseTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (confirmedTimeoutRef.current !== null) {
                window.clearTimeout(confirmedTimeoutRef.current);
            }

            if (collapseTimeoutRef.current !== null) {
                window.clearTimeout(collapseTimeoutRef.current);
            }
        };
    }, []);

    const isConfirming = phase !== "idle";
    const isDeleting = phase === "deleting";
    const isConfirmed = phase === "confirmed";
    const isCollapsing = phase === "collapsing";

    function openConfirmation() {
        if (phase !== "idle") {
            return;
        }

        mutation.reset();
        setPhase("confirming");
    }

    function cancelConfirmation() {
        if (phase === "deleting") {
            return;
        }

        mutation.reset();
        setPhase("idle");
    }

    async function confirmDelete() {
        if (phase !== "confirming") {
            return;
        }

        setPhase("deleting");

        try {
            await mutation.mutateAsync({ projectUuid });
            setPhase("confirmed");

            confirmedTimeoutRef.current = window.setTimeout(() => {
                setPhase("collapsing");

                collapseTimeoutRef.current = window.setTimeout(() => {
                    void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
                }, COLLAPSE_MS);
            }, CONFIRMED_MESSAGE_MS);
        } catch {
            setPhase("confirming");
        }
    }

    return {
        phase,
        error: mutation.error,
        isConfirming,
        isDeleting,
        isConfirmed,
        isCollapsing,
        openConfirmation,
        cancelConfirmation,
        confirmDelete,
    };
}
