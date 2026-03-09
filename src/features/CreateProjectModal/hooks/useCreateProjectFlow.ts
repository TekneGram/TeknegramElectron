
import { useState, useEffect } from "react";
import { projectProgressEventsAdapter } from "@/app/adapters/projects.adapters.events";
import type { CreateProjectRequest } from "@/app/ports/projects.ports";
import useCreateProjectMutation from "./useCreateProjectMutation";

const useCreateProjectFlow = () => {
    const mutation = useCreateProjectMutation();

    const [progressMessage, setProgressMessage] = useState<string>("Preparing project creation...");
    const [percent, setPercent] = useState<number>(0);
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = projectProgressEventsAdapter.subscribeToProjectCreationProgress((event) => {
            if (!activeRequestId) return;
            if(event.requestId !== activeRequestId) return;

            setProgressMessage(event.message)
            setPercent(event.percent);
        });

        return unsubscribe;
    }, [activeRequestId]);

    async function submitCreateProject(args: CreateProjectRequest) {
        setActiveRequestId(args.requestId);
        setProgressMessage("Preparing corpus build...");
        setPercent(0);

        try {
            await mutation.mutateAsync({
                ...args
            });
        } finally {
            setActiveRequestId(null);
        }
    }

    function resetProgress() {
        setActiveRequestId(null);
        setProgressMessage("Preparing project creation...");
        setPercent(0);
    }

    return {
        submitCreateProject,
        resetProgress,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        progressMessage,
        percent,
    };
}

export default useCreateProjectFlow;