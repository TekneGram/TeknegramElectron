import type {
    LlmProviderClient,
    LlmProviderRequest,
    LlmProviderResponse
} from "../shared/corpusMetadata.dto";

type OpenAiResponsesApiResponse = {
    model?: string;
    output_text?: string;
    usage?: {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
    };
};

export const openAiResponseClient: LlmProviderClient = {
    async generateStructuredResponse(
        request: LlmProviderRequest,
    ): Promise<LlmProviderResponse> {
        if (request.provider !== "openai") {
            throw new Error(`Unsupported provider for OpenAI client: ${request.provider}`);
        }

        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${request.apiKey}`,
            },
            body: JSON.stringify({
                model: request.model,
                instructions: request.systemPrompt,
                input: request.inputText,
                text: { 
                    format: {
                        type: "json_schema",
                        name: request.responseFormatName,
                        schema: request.responseSchema,
                        strict: true,
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI request failed with ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as OpenAiResponsesApiResponse;

        if (!data.output_text || !data.model) {
            throw new Error("OpenAI response missing output_text or model");
        }

        return {
            provider: "openai",
            model: data.model,
            outputText: data.output_text,
            usage: {
                inputTokens: data.usage?.input_tokens,
                outputTokens: data.usage?.output_tokens,
                totalTokens: data.usage?.total_tokens,
            },
        };
    },
};