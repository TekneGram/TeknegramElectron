
type ActiveCreateProjectOperation = {
    requestId: string;
    outputDir: string;
    cancel: () => void;
}


class ProjectServiceRegistry {
    private readonly createProjectOperations = new Map<string, ActiveCreateProjectOperation>();

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
}

export const projectServiceRegistry = new ProjectServiceRegistry();
export type { ActiveCreateProjectOperation };