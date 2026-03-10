import type { AppError } from "@/app/types/result";

export class FrontAppError extends Error {
    readonly kind: AppError["kind"];
    readonly debugId?: string;

    constructor(appError: AppError) {
        super(appError.userMessage);
        this.name = "FrontAppError";
        this.kind = appError.kind;
        this.debugId = appError.debugId;
    }
}

export function isFrontAppError(error: unknown): error is FrontAppError {
    return error instanceof FrontAppError;
}