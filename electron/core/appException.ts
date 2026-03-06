import type { AppErrorCode } from "./appError";

export class AppException extends Error {
    code: AppErrorCode;
    details?: string;
    retryable?: boolean;

    constructor(code: AppErrorCode, message: string, details?: string, retryable?: boolean) {
        super(message);
        this.name = "AppException";
        this.code = code;
        this.details = details;
        this.retryable = retryable;
    }
}

export function raiseAppError(
    code: AppErrorCode,
    message: string,
    details?: string,
    retryable?: boolean
): never {
    throw new AppException(code, message, details, retryable);
}