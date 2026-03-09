
export const PROJECTS_CREATE_PROGRESS_CHANNEL = "projects:create:progress" as const;

export type ProjectCreationProgressEvent = {
    requestId: string;
    correlationId: string;
    message: string;
    percent: number;
}

export type BackendEventMap = {
    [PROJECTS_CREATE_PROGRESS_CHANNEL]: ProjectCreationProgressEvent;
}