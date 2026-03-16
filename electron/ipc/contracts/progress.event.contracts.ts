
export const PROJECTS_CREATE_PROGRESS_CHANNEL = "projects:create:progress" as const;
export const PROJECTS_CORPUS_METADATA_PROGRESS_CHANNEL = "projects:corpus-metadata:progress" as const;

export type ProjectCreationProgressEvent = {
    requestId: string;
    correlationId: string;
    message: string;
    percent: number;
}

export type ProjectCorpusMetadataProgressEvent = {
    requestId: string;
    projectUuid: string;
    correlationId: string;
    stage: string;
    message: string;
    percent?: number;
}

export type BackendEventMap = {
    [PROJECTS_CREATE_PROGRESS_CHANNEL]: ProjectCreationProgressEvent;
    [PROJECTS_CORPUS_METADATA_PROGRESS_CHANNEL]: ProjectCorpusMetadataProgressEvent;
}
