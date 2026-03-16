import { z } from "zod";

export const corpusSummaryResponseSchema = z.object({
    summary: z
        .string()
        .trim()
        .min(1, "Summary must not be empty.")
        .refine((value) => {
            const sentenceCount = value
                .split(/[.!?]+/)
                .map((part) => part.trim())
                .filter(Boolean).length;
            
            return sentenceCount >= 2 && sentenceCount <= 10;
        }, "Summary must contain between 2 and 10 sentences."),
});

export type CorpusSummaryResponseDto = z.infer<typeof corpusSummaryResponseSchema>;
