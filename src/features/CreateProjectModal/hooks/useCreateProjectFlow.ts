import { useState, useEffect } from "react";
import { projectProgressEventsAdapter } from "@/app/adapters/projects.adapters.events";
import type { CreateProjectRequest } from "@/app/ports/projects.ports";
import useCreateProjectMutation from "./useCreateProjectMutation";
import { submitCancelCreateProject } from "../services/cancelProjectModal.service";
import { projectsAdapter } from "@/app/adapters/projects.adapters";

const useCreateProjectFlow = () => {
    const mutation = useCreateProjectMutation();

    const [progressMessage, setProgressMessage] = useState<string>("Preparing project creation...");
    const [percent, setPercent] = useState<number>(0);
    const [activeRequestId, setActiveRequestId] = useState<string>("");

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
        const updatedArgs = { ...args, requestId: crypto.randomUUID() };
        setActiveRequestId(updatedArgs.requestId);
        setProgressMessage("Preparing corpus build...");
        setPercent(0);

        try {
            await mutation.mutateAsync({
                ...updatedArgs
            });
        } finally {
            setActiveRequestId("");
        }
    }

    async function cancelCreateProject() {
        await submitCancelCreateProject(projectsAdapter, {requestId: activeRequestId});
        setProgressMessage("Cancelling project creation...");
    }

    function resetProgress() {
        setActiveRequestId("");
        setProgressMessage("Preparing project creation...");
        setPercent(0);
    }

    return {
        submitCreateProject,
        resetProgress,
        cancelCreateProject,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        progressMessage,
        percent,
    };
}

export default useCreateProjectFlow;