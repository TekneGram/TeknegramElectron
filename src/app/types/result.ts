export type AppError = {
    kind: "validation" | "processing" | "infrastructure" | "unknown";
    userMessage: string;
    debugId?: string;
};

export type AppResult<T> = 
    | { ok: true; value: T }
    | { ok: false; error: AppError };