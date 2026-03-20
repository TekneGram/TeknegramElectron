import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import { getDefaultApiProvider } from "@electron/db/repositories/apiRepositories";
import {
    findCorpusMetadataRow,
    findProjectCorpusRow,
    upsertCorpusMetadata,
} from "@electron/db/repositories/projectRepositories";
import type {
    GetCorpusMetadataRequest,
    GetCorpusMetadataResponse,
} from "@electron/ipc/contracts/projects.contracts";
import { PROJECTS_CORPUS_METADATA_PROGRESS_CHANNEL } from "@electron/ipc/contracts/progress.event.contracts";
import { createCredentialProvider } from "@electron/llm/createCredentialProvider";
import { summarizeCorpusMetadataController } from "@electron/llm/controllers/summarizeCorpusMetadataController";
import { createLlmProviderRegistry } from "@electron/llm/providers/providerRegistry";
import type { CorpusMetadataRoot } from "@electron/llm/shared/corpusMetadata.dto";
import type { LlmProviderName } from "@electron/llm/shared/llmProvider.dto";
import { secretStorageAdapter } from "@electron/infrastructure/adapters/secretStorage.adapter";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import NativeProcessRunner from "@electron/services/nativeProcessFactory";
import { logger } from "@electron/services/logger";
import { projectServiceRegistry } from "@electron/services/projectServiceRegistry";

type CorpusMetadataResult = GetCorpusMetadataResponse;

const credentialProvider = createCredentialProvider(secretStorageAdapter);
const providerRegistry = createLlmProviderRegistry();

export async function getCorpusMetadata(
    request: GetCorpusMetadataRequest,
    ctx: RequestContext,
): Promise<GetCorpusMetadataResponse> {
    const activeOperation = projectServiceRegistry.getCorpusMetadataOperation(request.projectUuid);

    if (activeOperation) {
        projectServiceRegistry.addCorpusMetadataListener(request.projectUuid, request.requestId, createProgressListener(request, ctx));

        try {
            return await activeOperation.promise;
        } finally {
            projectServiceRegistry.removeCorpusMetadataListener(request.projectUuid, request.requestId);
        }
    }

    const operationPromise = Promise.resolve().then(() => buildCorpusMetadata(request, ctx));
    projectServiceRegistry.registerCorpusMetadataOperation({
        projectUuid: request.projectUuid,
        promise: operationPromise,
        listeners: new Map([
            [request.requestId, createProgressListener(request, ctx)],
        ]),
    });

    try {
        return await operationPromise;
    } finally {
        projectServiceRegistry.removeCorpusMetadataListener(request.projectUuid, request.requestId);
        projectServiceRegistry.removeCorpusMetadataOperation(request.projectUuid);
    }
}

async function buildCorpusMetadata(
    request: GetCorpusMetadataRequest,
    ctx: RequestContext,
): Promise<CorpusMetadataResult> {
    logger.info("Starting corpus metadata lookup", {
        correlationId: ctx.correlationId,
        projectUuid: request.projectUuid,
        requestId: request.requestId,
    });

    emitProgress(request.projectUuid, {
        requestId: request.requestId,
        projectUuid: request.projectUuid,
        correlationId: ctx.correlationId,
        stage: "lookup_cache",
        message: "Checking cached corpus metadata.",
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());
    let projectCorpus;
    let defaultProvider;

    try {
        projectCorpus = findProjectCorpusRow(appDatabase.db, request.projectUuid);
        defaultProvider = getDefaultApiProvider(appDatabase.db);

        if (!projectCorpus) {
            raiseAppError("RESOURCE_NOT_FOUND", "Project corpus could not be found.");
        }

        const cachedMetadata = findCorpusMetadataRow(appDatabase.db, projectCorpus.corpus_uuid);

        if (cachedMetadata) {
            logger.info("Returning cached corpus metadata", {
                correlationId: ctx.correlationId,
                projectUuid: request.projectUuid,
                corpusUuid: projectCorpus.corpus_uuid,
            });

            emitProgress(request.projectUuid, {
                requestId: request.requestId,
                projectUuid: request.projectUuid,
                correlationId: ctx.correlationId,
                stage: "complete",
                message: "Using cached corpus metadata summary.",
                percent: 100,
            });

            return {
                projectUuid: request.projectUuid,
                summary: cachedMetadata.summary_text,
                source: "cache",
            };
        }
    } finally {
        appDatabase.close();
    }

    emitProgress(request.projectUuid, {
        requestId: request.requestId,
        projectUuid: request.projectUuid,
        correlationId: ctx.correlationId,
        stage: "run_native_process",
        message: "Computing corpus metadata.",
    });

    const runner = NativeProcessRunner.create<CorpusMetadataRoot>({
        executable: "corpus_metadata_pipeline",
        expectJsonLines: true,
        onProgress: (message) => {
            emitProgress(request.projectUuid, {
                requestId: request.requestId,
                projectUuid: request.projectUuid,
                correlationId: ctx.correlationId,
                stage: "native_progress",
                message: message.message,
                percent: message.percent,
            });
        },
    });

    const nativeResult = await runner.runProcess(
        JSON.stringify({
            command: "extractCorpusMetadata",
            corpusName: projectCorpus.corpus_name,
            artifactsDir: projectCorpus.binary_files_path,
        })
    );

    const metadata = nativeResult.result;

    if (!metadata) {
        raiseAppError("CPP_PROCESS_NON_ZERO_EXIT", "Corpus metadata pipeline returned no metadata.");
    }

    emitProgress(request.projectUuid, {
        requestId: request.requestId,
        projectUuid: request.projectUuid,
        correlationId: ctx.correlationId,
        stage: "summarize_metadata",
        message: "Summarizing corpus metadata.",
    });

    const summaryResult = await summarizeCorpusMetadataController(
        {
            metadata,
            preferredProvider: defaultProvider?.provider as LlmProviderName | undefined,
            preferredModel: defaultProvider?.default_model,
        },
        {
            credentialProvider,
            providerRegistry,
            onProgress: (event) => {
                emitProgress(request.projectUuid, {
                    requestId: request.requestId,
                    projectUuid: request.projectUuid,
                    correlationId: ctx.correlationId,
                    stage: event.stage,
                    message: event.message,
                });
            },
        }
    );

    if (!summaryResult.ok) {
        const summary = deriveFallbackSummary(metadata);

        logger.warn("Falling back to deterministic corpus metadata summary", {
            correlationId: ctx.correlationId,
            projectUuid: request.projectUuid,
            corpusUuid: projectCorpus.corpus_uuid,
            llmCode: summaryResult.error.code,
            llmMessage: summaryResult.error.message,
            llmDetails: summaryResult.error.details,
        });

        emitProgress(request.projectUuid, {
            requestId: request.requestId,
            projectUuid: request.projectUuid,
            correlationId: ctx.correlationId,
            stage: "complete",
            message: "Corpus metadata is ready.",
            percent: 100,
        });

        const now = new Date().toISOString();
        const writeDatabase = createAppDatabase(getRuntimeDbPath());
        try {
            upsertCorpusMetadata(writeDatabase.db, {
                corpus_uuid: projectCorpus.corpus_uuid,
                metadata_json: JSON.stringify(metadata),
                summary_text: "No summary provided",
                llm_provider: "llm not used",
                llm_model: "llm not used",
                created_at: now,
                updated_at: now
            })
        } finally {
            writeDatabase.close();
        }

        return {
            projectUuid: request.projectUuid,
            summary,
            source: "fallback",
        };
    }

    const now = new Date().toISOString();
    const writeDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        upsertCorpusMetadata(writeDatabase.db, {
            corpus_uuid: projectCorpus.corpus_uuid,
            metadata_json: JSON.stringify(metadata),
            summary_text: summaryResult.data.summary,
            llm_provider: summaryResult.data.provider,
            llm_model: summaryResult.data.model,
            created_at: now,
            updated_at: now,
        });
    } finally {
        writeDatabase.close();
    }

    emitProgress(request.projectUuid, {
        requestId: request.requestId,
        projectUuid: request.projectUuid,
        correlationId: ctx.correlationId,
        stage: "complete",
        message: "Corpus metadata is ready.",
        percent: 100,
    });

    return {
        projectUuid: request.projectUuid,
        summary: summaryResult.data.summary,
        source: "generated",
    };
}

function createProgressListener(request: GetCorpusMetadataRequest, ctx: RequestContext) {
    return (event: {
        requestId: string;
        projectUuid: string;
        correlationId: string;
        stage: string;
        message: string;
        percent?: number;
    }) => {
        ctx.sendEvent(PROJECTS_CORPUS_METADATA_PROGRESS_CHANNEL, {
            ...event,
            requestId: request.requestId,
            correlationId: ctx.correlationId,
        });
    };
}

function emitProgress(
    projectUuid: string,
    event: {
        requestId: string;
        projectUuid: string;
        correlationId: string;
        stage: string;
        message: string;
        percent?: number;
    },
): void {
    projectServiceRegistry.emitCorpusMetadataProgress(projectUuid, event);
}

function deriveFallbackSummary(metadata: CorpusMetadataRoot): string {
    return `This corpus has ${metadata.docs} documents, ${metadata.lemmas} lemmas, ${metadata.types} types and ${metadata.words} words.`;
}
