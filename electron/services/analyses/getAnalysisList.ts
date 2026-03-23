import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";

import { getAnalysisArtifactsByActivity } from "@electron/db/repositories/analysisRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "../logger";

import type { GetAnalysisListRequest, AnalysisArtifactList } from "@electron/ipc/contracts/analysis.contracts";

type ValidatedGetAnalysisListRequest = {
    activityId: string;
}

export async function getAnalysisList(
    request: GetAnalysisListRequest,
    ctx: RequestContext,
): Promise<AnalysisArtifactList> {

    const validatedRequest = validateGetAnalysisListRequest(request);
    
    logger.info("Retrieving the list of analyses", {
        correlationId: ctx.correlationId,
        activityId: validatedRequest.activityId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());
    try {
        const analysisList = getAnalysisArtifactsByActivity(appDatabase.db, validatedRequest.activityId);
        return analysisList.map((analysisItem) => ({
            uuid: analysisItem.uuid,
            analysisName: analysisItem.analysis_name,
            analysisType: analysisItem.analysis_type,
            config: analysisItem.config,
            displayName: analysisItem.display_name,
            description: analysisItem.description,
        }));
    } catch (err) {
        raiseAppError(
            "DB_QUERY_FAILED",
            "Failed to retrieve the analysis list",
            err instanceof Error ? err.stack : undefined
        );
    } finally {
        appDatabase.close();
    }
}

function requireNonEmptyString(value: string, fieldName:string): string {
    const trimmed = value.trim();

    if (!trimmed) {
        raiseAppError("VALIDATION_MISSING_FIELD", `${fieldName} cannot be empty`);
    }

    return trimmed;
}

function validateGetAnalysisListRequest(request: GetAnalysisListRequest): ValidatedGetAnalysisListRequest {
    const activityId = requireNonEmptyString(request.activityId, "Activity ID");

    return {
        activityId
    };
}
