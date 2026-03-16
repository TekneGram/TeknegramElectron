import { ZodError } from "zod";
import { summarizeCorpusMetadataOperations } from "../operations/summarizeCorpusMetadata";
import type {
    CorpusMetadataSummaryInput,
    SummarizeCorpusMetadataBoundaryDto,
    SummarizeCorpusMetadataControllerDeps,
} from "../shared/corpusMetadata.dto";

type SummarizeCorpusMetadataError = Extract<
    SummarizeCorpusMetadataBoundaryDto,
    { ok: false }
>["error"];

class LlmCredentialsMissingError extends Error {
    readonly code = "LLM_CREDENTIALS_MISSING";

    constructor(message = "No API key is configured for the selected provider.") {
        super(message);
    }
}

class LlmPolicyViolationError extends Error {
    readonly code = "LLM_POLICY_VIOLATION";

    constructor(message: string) {
         super(message);
    }
}

class LlmProviderFailedError extends Error {
    readonly code = "LLM_PROVIDER_FAILED";

    constructor(message: string) {
        super(message);
    }
}

class LlmResponseInvalidError extends Error {
    readonly code = "LLM_RESPONSE_INVALID";

    constructor(message: string) {
        super(message);
    }
}

export async function summarizeCorpusMetadataController(
    input: CorpusMetadataSummaryInput,
    deps: SummarizeCorpusMetadataControllerDeps,
): Promise<SummarizeCorpusMetadataBoundaryDto> {
    try {
        deps.onProgress?.({
            stage: "credentials",
            message: "Resolving LLM provider credentials"
        });

        const apiKey = await deps.credentialProvider.getApiKey("openai");

        if(!apiKey) {
            throw new LlmCredentialsMissingError();
        }

        const result = await summarizeCorpusMetadataOperations({
            input,
            apiKey,
            providerClient: deps.providerClient,
            onProgress: deps.onProgress
        });

        return {
            ok: true,
            data: result,
        };
    } catch (error) {
        return {
            ok: false,
            error: normalizeControllerError(error)
        }
    }
}

function normalizeControllerError(
    error: unknown,
): SummarizeCorpusMetadataError {
    if (error instanceof LlmCredentialsMissingError) {
      return { code: error.code, message: error.message };
    }

    if (error instanceof ZodError) {
      return {
        code: "LLM_RESPONSE_INVALID",
        message: `LLM response failed schema validation: ${error.message}`,
      };
    }

    if (error instanceof SyntaxError) {
      return {
        code: "LLM_RESPONSE_INVALID",
        message: "LLM response was not valid JSON.",
      };
    }

    if (error instanceof Error) {
      if (error.message.includes("exceeds supported depth")) {
        return {
          code: "LLM_POLICY_VIOLATION",
          message: error.message,
        };
      }

      if (error.message.includes("OpenAI request failed")) {
        return {
          code: "LLM_PROVIDER_FAILED",
          message: error.message,
        };
      }

      return {
        code: "LLM_REQUEST_INVALID",
        message: error.message,
      };
    }

    return {
      code: "LLM_PROVIDER_FAILED",
      message: "Unknown LLM error.",
    };
  }
