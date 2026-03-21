import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import { runInTransaction } from "@electron/db/sqlite";

import { countAnalysisRows, getCorpusMetadataRow, insertAnalysisRow, getAnalysisResponseByUuid } from "@electron/db/repositories/analysisRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/services/logger";

import type { CreateAnalysisRequest, AnalysisCorpusMetadataResponse } from "@electron/ipc/contracts/analysis.contracts";
import type { NewAnalysisRow } from "@electron/db/repositories/analysisRepositories";
import { randomUUID } from 'node:crypto';

type ValidatedCreateAnalysisRequest = {
    corpusId: string;
    activityId: string;
    analysisType: CreateAnalysisRequest["analysisType"];
    config: string | null;
};


export async function createAnalysisMetadataInspection(
    request: CreateAnalysisRequest,
    ctx: RequestContext,
): Promise<AnalysisCorpusMetadataResponse> {
    const validatedRequest = validateCreateAnalysisRequest(request);

    logger.info("Starting the create analysis process", {
        correlationId: ctx.correlationId,
        analysisType: validatedRequest.analysisType,
        activityId: validatedRequest.activityId,
        corpusId: validatedRequest.corpusId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());
    try {
        return runInTransaction(appDatabase.db, () => {
            const analysisNumber = countAnalysisRows(appDatabase.db) + 1;
            const now = new Date().toISOString();
            const analysisRow: NewAnalysisRow = {
                uuid: randomUUID(),
                analysis_type: validatedRequest.analysisType,
                activity_uuid: validatedRequest.activityId,
                analysis_name: `analysis_${analysisNumber}`,
                config: validatedRequest.config,
                created_at: now,
                updated_at: now,
            };

            insertAnalysisRow(appDatabase.db, analysisRow);
            const analysisResponseRow = getAnalysisResponseByUuid(appDatabase.db, analysisRow.uuid);
            const corpusMetadataRow = getCorpusMetadataRow(appDatabase.db, validatedRequest.corpusId);

            if (!analysisResponseRow) {
                raiseAppError("RESOURCE_NOT_FOUND", "Created analysis could not be retrieved.");
            }

            if (!corpusMetadataRow) {
                raiseAppError("RESOURCE_NOT_FOUND", "Corpus metadata could not be found.");
            }

            return {
                analysis: {
                    uuid: analysisResponseRow.uuid,
                    analysisName: analysisResponseRow.analysis_name,
                    analysisType: analysisResponseRow.analysis_type,
                    config: analysisResponseRow.config,
                    displayName: analysisResponseRow.display_name,
                    description: analysisResponseRow.description,
                },
                analysisData: {
                    corpusUuid: corpusMetadataRow.corpus_uuid,
                    metadataJson: corpusMetadataRow.metadata_json,
                    summaryText: corpusMetadataRow.summary_text,
                    llmProvider: corpusMetadataRow.llm_provider,
                    llmModel: corpusMetadataRow.llm_model,
                    binaryFilesPath: corpusMetadataRow.binary_files_path,
                },
            };
        });
    } catch (err) {
        raiseAppError(
            "DB_QUERY_FAILED",
            "Failed to create a new analysis entry in database",
            err instanceof Error ? err.stack : undefined
        );
    } finally {
        appDatabase.close();
    }
}

function requireNonEmptyString(value: string, fieldName: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
        raiseAppError("VALIDATION_MISSING_FIELD", `${fieldName} cannot be empty.`);
    }

    return trimmed;
}

function validateCreateAnalysisRequest(request: CreateAnalysisRequest): ValidatedCreateAnalysisRequest {
    const corpusId = requireNonEmptyString(request.corpusId, "Corpus ID");
    const activityId = requireNonEmptyString(request.activityId, "Activity ID");
    const config = request.config === null ? null : requireNonEmptyString(request.config, "Config");

    return {
        corpusId,
        activityId,
        analysisType: request.analysisType,
        config,
    };
}
