import type {
    LlmProviderClient,
    LlmProviderRequest,
    LlmProviderResponse
} from "../shared/llmProvider.dto";

type OpenAiResponsesApiResponse = {
    model?: string;
    output_text?: string;
    output?: OpenAiOutputItem[];
    usage?: {
        input_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
    };
};

type OpenAiOutputItem = {
    type?: string;
    content?: OpenAiContentItem[];
};

type OpenAiContentItem = {
    type?: string;
    text?: string;
    json?: unknown;
};

type OpenAiErrorResponse = {
    error?: {
        message?: string;
        type?: string;
        code?: string;
        param?: string;
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
            const errorMessage = deriveOpenAiErrorMessage(errorText);
            const prefix = response.status >= 400 && response.status < 500
                ? "OpenAI request invalid"
                : "OpenAI provider request failed";

            throw new Error(`${prefix} (status ${response.status}): ${errorMessage}`);
        }

        const data = (await response.json()) as OpenAiResponsesApiResponse;
        const outputText = extractOutputText(data);

        if (!outputText || !data.model) {
            throw new Error(
                `OpenAI response missing extractable output text or model. Response preview: ${truncateErrorText(JSON.stringify(data), 2000)}`
            );
        }

        return {
            provider: "openai",
            model: data.model,
            outputText,
            usage: {
                inputTokens: data.usage?.input_tokens,
                outputTokens: data.usage?.output_tokens,
                totalTokens: data.usage?.total_tokens,
            },
        };
    },
};

function deriveOpenAiErrorMessage(errorText: string): string {
    try {
        const parsed = JSON.parse(errorText) as OpenAiErrorResponse;

        if (parsed.error?.message) {
            const parts = [
                parsed.error.message,
                parsed.error.type ? `type=${parsed.error.type}` : "",
                parsed.error.code ? `code=${parsed.error.code}` : "",
                parsed.error.param ? `param=${parsed.error.param}` : "",
            ].filter(Boolean);

            return truncateErrorText(parts.join(" | "));
        }
    } catch {
        // Preserve raw text fallback below.
    }

    return truncateErrorText(errorText);
}

function extractOutputText(data: OpenAiResponsesApiResponse): string | null {
    if (typeof data.output_text === "string" && data.output_text.trim()) {
        return data.output_text;
    }

    const outputItems = Array.isArray(data.output) ? data.output : [];

    for (const outputItem of outputItems) {
        const contentItems = Array.isArray(outputItem.content) ? outputItem.content : [];

        for (const contentItem of contentItems) {
            if (typeof contentItem.text === "string" && contentItem.text.trim()) {
                return contentItem.text;
            }

            if (contentItem.json !== undefined) {
                return JSON.stringify(contentItem.json);
            }
        }
    }

    return null;
}

function truncateErrorText(value: string, limit = 500): string {
    const normalized = value.replace(/\s+/g, " ").trim();

    if (normalized.length <= limit) {
        return normalized;
    }

    return `${normalized.slice(0, limit)}...`;
}
