export type AppErrorCode = 
    | "VALIDATION_INVALID_PAYLOAD"
    | "VALIDATION_MISSING_FIELD"
    | "VALIDATION_INVALID_STATE"
    | "AUTH_UNAUTHORIZED"
    | "AUTH_FORBIDDEN"
    | "RESOURCE_NOT_FOUND"
    | "RESOURCE_CONFLICT"
    | "RATE_LIMITED"
    | "DB_CONNECTION_FAILED"
    | "DB_QUERY_FAILED"
    | "DB_CONSTRAINT_VIOLATION"
    | "FS_NOT_FOUND"
    | "FS_PERMISSION_DENIED"
    | "FS_WRITE_FAILED"
    | "CPP_PROCESS_SPAWN_FAILED"
    | "CPP_PROCESS_NON_ZERO_EXIT"
    | "CPP_PROCESS_TIMEOUT"
    | "CPP_PROCESS_CANCELLED"
    | "IPC_CHANNEL_NOT_FOUND"
    | "IPC_HANDLER_FAILED"
    | "NETWORK_UNAVAILABLE"
    | "NETWORK_TIMEOUT"
    | "DEPENDENCY_UNAVAILABLE"
    | "INTERNAL_UNEXPECTED"

export type AppError = {
    code: AppErrorCode;
    message: string;
    details?: string
    correlationId?: string // log lookup id
    retryable?: boolean
};

export type Result<T> = 
    | { ok: true; data: T }
    | { ok: false; error: AppError };

export function toAppError(err: unknown, fallback: AppErrorCode = "INTERNAL_UNEXPECTED"): AppError {
    if (typeof err === "object" && err !== null) {
        const anyErr = err as Record<string, unknown>;
        if (typeof anyErr.code === "string" && typeof anyErr.message === "string") {
            return {
                code: anyErr.code as AppErrorCode,
                message: anyErr.message,
                details: typeof anyErr.details === "string" ? anyErr.details: undefined,
                correlationId: typeof anyErr.correlationId === "string" ? anyErr.correlationId : undefined,
                retryable: typeof anyErr.retryable === "boolean" ? anyErr.retryable : undefined,
            };
        }
    }
    const message = err instanceof Error ? err.message : "Unexpected error";
    const details = err instanceof Error ? err.stack : undefined;
    return { code: fallback, message, details };
}
