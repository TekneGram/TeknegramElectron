import type {
    ProjectProgressEventsPort,
    ProjectCreationProgress,
    ProjectCorpusMetadataProgress,
} from "@/app/ports/projects.ports.events";

export const projectProgressEventsAdapter: ProjectProgressEventsPort = {
    subscribeToProjectCreationProgress(listener) {
        return window.api.onProjectCreationProgress((payload) => {
            const event: ProjectCreationProgress = {
                requestId: payload.requestId,
                correlationId: payload.correlationId,
                message: payload.message,
                percent: payload.percent,
            }
            listener(event);
        });
    },

    subscribeToProjectCorpusMetadataProgress(listener) {
        return window.api.onProjectCorpusMetadataProgress((payload) => {
            const event: ProjectCorpusMetadataProgress = {
                requestId: payload.requestId,
                projectUuid: payload.projectUuid,
                correlationId: payload.correlationId,
                stage: payload.stage,
                message: payload.message,
                percent: payload.percent,
            };
            listener(event);
        });
    }
}
