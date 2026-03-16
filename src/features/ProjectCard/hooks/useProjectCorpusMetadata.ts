import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectsAdapter } from "@/app/adapters/projects.adapters";
import { projectProgressEventsAdapter } from "@/app/adapters/projects.adapters.events";
import { fetchCorpusMetadata } from "../services/getCorpusMetadata.service";

const INITIAL_PROGRESS_MESSAGE = "Preparing corpus metadata summary...";

type UseProjectCorpusMetadataArgs = {
    projectUuid: string;
};

export function useProjectCorpusMetadata({ projectUuid }: UseProjectCorpusMetadataArgs) {
    const requestIdRef = useRef(crypto.randomUUID());
    const [progressMessage, setProgressMessage] = useState(INITIAL_PROGRESS_MESSAGE);
    const [stage, setStage] = useState("idle");
    const [percent, setPercent] = useState<number | undefined>(undefined);

    const query = useQuery({
        queryKey: ["project-corpus-metadata", projectUuid],
        staleTime: Infinity,
        refetchOnMount: false,
        retry: false,
        queryFn: async () => {
            setProgressMessage(INITIAL_PROGRESS_MESSAGE);
            setStage("starting");
            setPercent(undefined);

            return fetchCorpusMetadata(projectsAdapter, {
                requestId: requestIdRef.current,
                projectUuid,
            });
        },
    });

    useEffect(() => {
        const unsubscribe = projectProgressEventsAdapter.subscribeToProjectCorpusMetadataProgress((event) => {
            if (event.projectUuid !== projectUuid) {
                return;
            }

            if (event.requestId !== requestIdRef.current) {
                return;
            }

            setProgressMessage(event.message);
            setStage(event.stage);
            setPercent(event.percent);
        });

        return unsubscribe;
    }, [projectUuid]);

    return {
        summary: query.data?.summary ?? "",
        source: query.data?.source,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        progressMessage,
        progressStage: stage,
        percent,
    };
}
