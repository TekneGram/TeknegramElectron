import { ZodError } from "zod";
import { summarizeCorpusMetadataOperation } from "../operations/summarizeCorpusMetadata";
import { resolveCorpusSummaryPolicy } from "../policies/corpusSummaryPolicy";
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
    readonly code = "LLM_CREDENTIALS_MISSING" as const;

    constructor(message = "No API key is configured for the selected provider.") {
        super(message);
    }
}

export async function summarizeCorpusMetadataController(
    input: CorpusMetadataSummaryInput,
    deps: SummarizeCorpusMetadataControllerDeps,
): Promise<SummarizeCorpusMetadataBoundaryDto> {
    try {
        deps.onProgress?.({
            stage: "policy",
            message: "Resolving provider and model policy for corpus summarization."
        });

        const resolvedPolicy = resolveCorpusSummaryPolicy({
            preferredProvider: input.preferredProvider,
            preferredModel: input.preferredModel,
        });

        deps.onProgress?.({
            stage: "credentials",
            message: `Resolving credentials for provider "${resolvedPolicy.provider}".`
        });

        const apiKey = await deps.credentialProvider.getApiKey(resolvedPolicy.provider);

        if(!apiKey) {
            throw new LlmCredentialsMissingError(
                `No API key is configured for provider "${resolvedPolicy.provider}".`
            );
        }

        const result = await summarizeCorpusMetadataOperation({
            input,
            resolvedPolicy,
            apiKey,
            providerRegistry: deps.providerRegistry,
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

      if (error.message.includes("Unsupported provider")) {
        return {
          code: "LLM_POLICY_VIOLATION",
          message: error.message,
        };
      }

      if (error.message.includes("request failed")) {
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
