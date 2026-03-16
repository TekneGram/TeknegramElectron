import { z } from "zod";
import { corpusSummaryResponseSchema } from "../schemas/corpusSummaryResponseSchema";
import {
    deriveCorpusMetadataSummary,
    enforceMetadataDepthLimit,
} from "../policies/corpusSummaryPolicy";
import type {
    CorpusMetadataSummaryInput,
    CorpusMetadataSummaryResult,
} from "../shared/corpusMetadata.dto";
import type {
    LlmProviderRegistry,
    ResolvedCorpusSummaryPolicy,
} from "../shared/llmProvider.dto";

export async function summarizeCorpusMetadataOperation(args: {
    input: CorpusMetadataSummaryInput;
    resolvedPolicy: ResolvedCorpusSummaryPolicy;
    apiKey: string;
    providerRegistry: LlmProviderRegistry;
    onProgress?: (event: { stage: "prepare_request" | "provider_request" | "normalize_response"; message: string }) => void;
}): Promise<CorpusMetadataSummaryResult> {
    
    const { input, resolvedPolicy, apiKey, providerRegistry, onProgress } = args;

    enforceMetadataDepthLimit(input.metadata);

    onProgress?.({
        stage: "prepare_request",
        message: "Preparing compact corpus metadata summary."
    });

    const derivedSummary = deriveCorpusMetadataSummary(input.metadata);

    const providerClient = providerRegistry.getClient(resolvedPolicy.provider);

    const providerRequest = {
        provider: resolvedPolicy.provider,
        apiKey,
        model: resolvedPolicy.model,
        systemPrompt: resolvedPolicy.systemPrompt,
        responseFormatName: resolvedPolicy.responseFormatName,
        responseSchema: z.toJSONSchema(corpusSummaryResponseSchema),
        inputText: JSON.stringify({
            task: "Summarize this corpus metadata in 2 or 3 sentences for an end user.",
            corpusMetadata: derivedSummary,
        }),
    };

    onProgress?.({
        stage: "provider_request",
        message: `Sending corpus metadata to provider "${resolvedPolicy.provider}".`
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
