import { useState, useEffect, useRef } from "react";
import { projectProgressEventsAdapter } from "@/app/adapters/projects.adapters.events";
import type { CreateProjectRequest } from "@/app/ports/projects.ports";
import useCreateProjectMutation from "./useCreateProjectMutation";
import { submitCancelCreateProject } from "../services/cancelProjectModal.service";
import { projectsAdapter } from "@/app/adapters/projects.adapters";
import { isFrontAppError } from "@/app/errors/FrontAppError";
import { toastifyNotifier } from "@/app/adapters/notifications";

// type UseCreateProjectFlowArgs = {
//     onSuccess: () => void;
// };

// type UseCreateProjectFlowResult = {
//     submitCreateProject: (args: Omit<CreateProjectRequest, "requestId">) => Promise<void>;
//     cancelCreateProject: () => Promise<void>;
//     handleRequestClose: () => void;

//     isPending: boolean;
//     canClose: boolean;
//     showOverlay: boolean;
//     progressMessage: string;
//     percent: number;

//     errorMessage: string | null;
// };

const INITIAL_PROGRESS_MESSAGE = "Preparing project creation...";

const useCreateProjectFlow = () => {
    const mutation = useCreateProjectMutation();

    const [progressMessage, setProgressMessage] = useState<string>(INITIAL_PROGRESS_MESSAGE);
    const [percent, setPercent] = useState<number>(0);
    const [activeRequestId, setActiveRequestId] = useState<string>("");
    const [cancellationRequested, setCancellationRequested] = useState<boolean>(false);
    const [wasCancelled, setWasCancelled] = useState<boolean>(false);

    const activeRequestIdRef = useRef<string>("");
    const cancellationRequestedRef = useRef<boolean>(false);

    function updateActiveRequestId(requestId: string) {
        activeRequestIdRef.current = requestId;
        setActiveRequestId(requestId);
    }

    function updateCancellationRequested(requested: boolean) {
        cancellationRequestedRef.current = requested;
        setCancellationRequested(requested);
    }

    useEffect(() => {
        const unsubscribe = projectProgressEventsAdapter.subscribeToProjectCreationProgress((event) => {
            if (!activeRequestId) return;
            if(event.requestId !== activeRequestId) return;

            setProgressMessage(event.message)
            setPercent(event.percent);
        });

        return unsubscribe;
    }, [activeRequestId]);

    async function submitCreateProject(args: Omit<CreateProjectRequest, "requestId">) {
        mutation.reset();
        setWasCancelled(false);
        updateCancellationRequested(false);
        const updatedArgs = { ...args, requestId: crypto.randomUUID() };
        updateActiveRequestId(updatedArgs.requestId);
        setProgressMessage("Preparing corpus build...");
        setPercent(0);

        try {
            await mutation.mutateAsync({
                ...updatedArgs
            });
        } catch (err) {
            if (cancellationRequestedRef.current && isFrontAppError(err) && err.kind === "cancelled") {
                setWasCancelled(true);
                updateCancellationRequested(false);
                resetProgress();
                toastifyNotifier.success("Project creation cancelled", {
                    id: "create-project-cancelled"
                });
                return;
            }
            throw err;
        } finally {
            updateActiveRequestId("");
        }
    }

    async function cancelCreateProject() {
        if (!activeRequestIdRef.current) {
            return;
        }
        if (cancellationRequestedRef.current) {
            return;
        }

        updateCancellationRequested(true);
        setProgressMessage("Cancelling project creation...");
        await submitCancelCreateProject(projectsAdapter, {requestId: activeRequestIdRef.current});
    }

    function resetProgress() {
        updateActiveRequestId("");
        updateCancellationRequested(false);
        mutation.reset();
        setProgressMessage(INITIAL_PROGRESS_MESSAGE);
        setPercent(0);
    }

    return {
        submitCreateProject,
        resetProgress,
        cancelCreateProject,
        cancellationRequested,
        wasCancelled,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        progressMessage,
        percent,
    };
}

export default useCreateProjectFlow;
