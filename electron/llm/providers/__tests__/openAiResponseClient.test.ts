import { beforeEach, describe, expect, it, vi } from "vitest";

import { openAiResponseClient } from "../openAiResponseClient";

describe("openAiResponseClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("surfaces structured 4xx request errors with the provider message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({
        error: {
          message: "Invalid schema for response_format 'corpus_metadata_summary'.",
          type: "invalid_request_error",
          code: "invalid_json_schema",
          param: "text.format.schema",
        },
      }),
    }));

    await expect(
      openAiResponseClient.generateStructuredResponse({
        provider: "openai",
        apiKey: "secret",
        model: "gpt-4.1-mini",
        systemPrompt: "Summarize",
        responseFormatName: "corpus_metadata_summary",
        responseSchema: { type: "object" },
        inputText: "{\"task\":\"summarize\"}",
      })
    ).rejects.toThrow(
      "OpenAI request invalid (status 400): Invalid schema for response_format 'corpus_metadata_summary'. | type=invalid_request_error | code=invalid_json_schema | param=text.format.schema"
    );
  });

  it("extracts structured output text from output content when output_text is absent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        model: "gpt-4.1-mini-2025-04-14",
        output: [
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: "{\"summary\":\"This corpus is balanced across four major domains.\"}",
              },
            ],
          },
        ],
        usage: {
          input_tokens: 120,
          output_tokens: 22,
          total_tokens: 142,
        },
      }),
    }));

    await expect(
      openAiResponseClient.generateStructuredResponse({
        provider: "openai",
        apiKey: "secret",
        model: "gpt-4.1-mini",
        systemPrompt: "Summarize",
        responseFormatName: "corpus_metadata_summary",
        responseSchema: { type: "object" },
        inputText: "{\"task\":\"summarize\"}",
      })
    ).resolves.toEqual({
      provider: "openai",
      model: "gpt-4.1-mini-2025-04-14",
      outputText: "{\"summary\":\"This corpus is balanced across four major domains.\"}",
      usage: {
        inputTokens: 120,
        outputTokens: 22,
        totalTokens: 142,
      },
    });
  });
});
