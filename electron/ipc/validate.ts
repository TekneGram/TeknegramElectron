import  { ZodType } from "zod";
import { AppException } from "../core/appException";

export function formatValidationIssues(issues: { path: PropertyKey[]; message: string }[]): string {
    return issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
}

export function validateOrThrow<T>(schema: ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);

    if (!result.success) {
        const details = formatValidationIssues(result.error.issues);
        throw new AppException("VALIDATION_INVALID_PAYLOAD", "Invalid request payload", details, false);
    }

    return result.data;
}