import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";

import { getAnalysisListRows } from "@electron/db/repositories/analysisRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "../logger";

import type { GetAnalysisListRequest, AnalysisListResponse } from "@electron/ipc/contracts/analysis.contracts";

export async function getAnalysisList(
    request: GetAnalysisListRequest,
    ctx: RequestContext,
): Promise<AnalysisListResponse> {
    
    logger.info("Retrieving the list of analyses", {
        correlationId: ctx.correlationId,
        activityId: request.activityId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());
    try {
        const analysisList = getAnalysisListRows(appDatabase.db, request.activityId);

        if (!analysisList) {
            raiseAppError("RESOURCE_NOT_FOUND", "Could not find any analyses");
        }

        const analysisListResponse = analysisList.map((analysisItem) => {
            return (
                {
                    uuid: analysisItem.uuid,
                    analysisName: analysisItem.analysis_name,
                    analysisType: analysisItem.analysis_type,
                    displayName: analysisItem.display_name,
                    description: analysisItem.description
                }
            );
        });

        return analysisListResponse;
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