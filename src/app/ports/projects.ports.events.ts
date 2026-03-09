export type ProjectCreationProgress = {
    requestId: string;
    correlationId: string;
    message: string;
    percent: number;
};

export type Unsubscribe = () => void;

export interface ProjectProgressEventsPort {
    subscribeToProjectCreationProgress(
        listener: (event: ProjectCreationProgress) => void
    ): Unsubscribe;
}