import { BackendEventMap } from "@electron/ipc/contracts/progress.event.contracts";

export type RequestContext = {
    correlationId: string;
    sendEvent<K extends keyof BackendEventMap>(
        channel: string, 
        payload: BackendEventMap[K]
    ): void;
}