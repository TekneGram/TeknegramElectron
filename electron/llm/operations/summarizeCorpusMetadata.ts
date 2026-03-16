import { z } from "zod";
import { corpusSummaryResponseSchema } from "../schemas/corpusSummaryResponseSchema";
import {
    deriveCorpusMetadataSummary,
    enforceMetadataDepthLimit,
    resolveCorpusSummaryPolicy,
} from "../policies/corpusSummaryPolicy";
import type {
    CorpusMetadataSummaryInput,
    CorpusMetadataSummaryResult,
    LlmProviderClient
} from "../shared/corpusMetadata.dto";

export async function summarizeCorpusMetadataOperations(args: {
    input: CorpusMetadataSummaryInput;
    apiKey: string;
    providerClient: LlmProviderClient;
    onProgress?: (event: { stage: "prepare_request" | "provider_request" | "normalize_response"; message: string }) => void;
}): Promise<CorpusMetadataSummaryResult> {
    const { input, apiKey, providerClient, onProgress } = args;

    enforceMetadataDepthLimit(input.metadata);

    onProgress?.({
        stage: "prepare_request",
        message: "Preparing compact corpus metadata summary."
    });

    const policy = resolveCorpusSummaryPolicy(input.preferredModel);
    const derivedSummary = deriveCorpusMetadataSummary(input.metadata);

    const providerRequest = {
        provider: policy.provider,
        apiKey,
        model: policy.model,
        systemPrompt: policy.systemPrompt,
        responseFormatName: policy.responseFormatName,
        responseSchema: z.toJSONSchema(corpusSummaryResponseSchema),
        inputText: JSON.stringify({
            task: "Summarize this corpus metadata in 2 or 2 sentences for an end user.",
            corpusMetadata: derivedSummary,
        }),
    };

    onProgress?.({
        stage: "provider_request",
        message: "Sending corpus metadata to LLM"
    });

    const providerResponse = await providerClient.generateStructuredResponse(providerRequest);

    onProgress?.({
        stage: "normalize_response",
        message: "Validating and normalizing the LLM response.",
    });

    const parsedJson = JSON.parse(providerResponse.outputText) as unknown;
    const normalized = corpusSummaryResponseSchema.parse(parsedJson);

    return {
        summary: normalized.summary,
        provider: providerResponse.provider,
        model: providerResponse.model,
        usage: providerResponse.usage,
        fallbackUsed: false,
    };
}