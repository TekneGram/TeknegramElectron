export type AppError = {
    kind: "validation" | "processing" | "infrastructure" | "cancelled" | "unknown";
    userMessage: string;
    debugId?: string;
};

export type AppResult<T> = 
    | { ok: true; value: T }
    | { ok: false; error: AppError };