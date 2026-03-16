import { z } from "zod";
import type {
    DeleteApiProviderKeyRequest,
    SaveApiProviderKeyRequest,
    SetDefaultApiProviderRequest,
} from "../contracts/settings.contracts";

const providerSchema = z.enum(["openai", "anthropic", "gemini"]);

export const saveApiProviderKeySchema: z.ZodType<SaveApiProviderKeyRequest> = z.object({
    provider: providerSchema,
    apiKey: z.string().min(1),
});

export const deleteApiProviderKeySchema: z.ZodType<DeleteApiProviderKeyRequest> = z.object({
    provider: providerSchema,
});

export const setDefaultApiProviderSchema: z.ZodType<SetDefaultApiProviderRequest> = z.object({
    provider: providerSchema,
});
