import type {
    ProjectProgressEventsPort,
    ProjectCreationProgress
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
    }
}