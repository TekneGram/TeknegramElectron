
type ActiveCreateProjectOperation = {
    requestId: string;
    outputDir: string;
    cancel: () => void;
}

type CorpusMetadataProgressListener = (event: {
    requestId: string;
    projectUuid: string;
    correlationId: string;
    stage: string;
    message: string;
    percent?: number;
}) => void;

type ActiveCorpusMetadataOperation = {
    projectUuid: string;
    promise: Promise<{
        projectUuid: string;
        summary: string;
        source: "cache" | "generated" | "fallback";
    }>;
    listeners: Map<string, CorpusMetadataProgressListener>;
};

class ProjectServiceRegistry {
    private readonly createProjectOperations = new Map<string, ActiveCreateProjectOperation>();
    private readonly corpusMetadataOperations = new Map<string, ActiveCorpusMetadataOperation>();

    registerCreateProjectOperation(operation: ActiveCreateProjectOperation): void {
        this.createProjectOperations.set(operation.requestId, operation);
    }

    getCreateProjectOperation(requestId: string): ActiveCreateProjectOperation | undefined {
        return this.createProjectOperations.get(requestId);
    }

    removeCreateProjectOperation(requestId: string): void {
        this.createProjectOperations.delete(requestId);
    }

    hasCreateProjectOperation(requestId: string): boolean {
        return this.createProjectOperations.has(requestId);
    }

    registerCorpusMetadataOperation(operation: ActiveCorpusMetadataOperation): void {
        this.corpusMetadataOperations.set(operation.projectUuid, operation);
    }

    getCorpusMetadataOperation(projectUuid: string): ActiveCorpusMetadataOperation | undefined {
        return this.corpusMetadataOperations.get(projectUuid);
    }

    removeCorpusMetadataOperation(projectUuid: string): void {
        this.corpusMetadataOperations.delete(projectUuid);
    }

    addCorpusMetadataListener(projectUuid: string, requestId: string, listener: CorpusMetadataProgressListener): void {
        const operation = this.corpusMetadataOperations.get(projectUuid);

        if (!operation) {
            return;
        }

        operation.listeners.set(requestId, listener);
    }

    removeCorpusMetadataListener(projectUuid: string, requestId: string): void {
        const operation = this.corpusMetadataOperations.get(projectUuid);

        if (!operation) {
            return;
        }

        operation.listeners.delete(requestId);
    }

    emitCorpusMetadataProgress(projectUuid: string, event: Parameters<CorpusMetadataProgressListener>[0]): void {
        const operation = this.corpusMetadataOperations.get(projectUuid);

        if (!operation) {
            return;
        }

        for (const listener of operation.listeners.values()) {
            listener(event);
        }
    }
}

export const projectServiceRegistry = new ProjectServiceRegistry();
export type { ActiveCreateProjectOperation, ActiveCorpusMetadataOperation };
