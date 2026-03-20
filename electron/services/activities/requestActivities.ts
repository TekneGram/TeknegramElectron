import { randomUUID } from "node:crypto";
import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import { runInTransaction } from "@electron/db/sqlite";
import {
    countActivityRowsByProjectUuidAndType,
    findActivityProjectContextRowByProjectUuid,
    findActivityTypeRowByActivityType,
    insertActivityRow,
    insertActivitySummaryRow,
    listActivityDetailsRowsByProjectUuidAndType,
} from "@electron/db/repositories/activityRepositories";
import type {
    ActivityDetails,
    ActivityRequest,
    ActivityResponse,
    ActivityType,
} from "@electron/ipc/contracts/activities.contracts";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "../logger";

const ACTIVITY_SUMMARY_DESCRIPTIONS: Record<ActivityType, string> = {
    lb_activities: "Samples corpora, extracts lexical bundles and analyzes them.",
};

export async function requestActivities(
    request: ActivityRequest,
    ctx: RequestContext,
): Promise<ActivityResponse> {
    logger.info("Handling activities request", {
        correlationId: ctx.correlationId,
        projectId: request.projectId,
        activityType: request.activityType,
        requestType: request.requestType,
    });

    switch (request.requestType) {
        case "get":
            return getActivities(request.projectId, request.activityType, ctx);
        case "create":
            return createActivity(request.projectId, request.activityType, ctx);
        default:
            raiseAppError("VALIDATION_INVALID_STATE", "Unsupported activity request type.");
    }
}

async function getActivities(
    projectId: string,
    activityType: ActivityType,
    ctx: RequestContext,
): Promise<ActivityResponse> {
    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const contextRow = findActivityProjectContextRowByProjectUuid(appDatabase.db, projectId);

        if (!contextRow) {
            raiseAppError("RESOURCE_NOT_FOUND", "Project corpus could not be found.");
        }

        const activities = listActivityDetailsRowsByProjectUuidAndType(appDatabase.db, projectId, activityType)
            .map(mapActivityDetailsRow);

        logger.info("Returning activities", {
            correlationId: ctx.correlationId,
            projectId,
            activityType,
            activityCount: activities.length,
        });

        return {
            projectId: contextRow.project_id,
            corpusId: contextRow.corpus_id,
            corpusName: contextRow.corpus_name,
            binaryFilesPath: contextRow.binary_files_path,
            activities,
        };
    } finally {
        appDatabase.close();
    }
}

async function createActivity(
    projectId: string,
    activityType: ActivityType,
    ctx: RequestContext,
): Promise<ActivityResponse> {
    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        return runInTransaction(appDatabase.db, () => {
            const contextRow = findActivityProjectContextRowByProjectUuid(appDatabase.db, projectId);

            if (!contextRow) {
                raiseAppError("RESOURCE_NOT_FOUND", "Project corpus could not be found.");
            }

            const activityTypeRow = findActivityTypeRowByActivityType(appDatabase.db, activityType);

            if (!activityTypeRow) {
                raiseAppError("RESOURCE_NOT_FOUND", "Activity type could not be found.");
            }

            const activityNumber = countActivityRowsByProjectUuidAndType(appDatabase.db, projectId, activityType) + 1;
            const now = new Date().toISOString();
            const activityId = randomUUID();
            const summaryId = randomUUID();
            const activityName = `${activityTypeRow.display_name} ${activityNumber}`;

            insertActivityRow(appDatabase.db, {
                uuid: activityId,
                corpus_uuid: contextRow.corpus_id,
                activity_name: activityName,
                activity_type: activityType,
                created_at: now,
                updated_at: now,
            });

            insertActivitySummaryRow(appDatabase.db, {
                uuid: summaryId,
                activity_uuid: activityId,
                description: ACTIVITY_SUMMARY_DESCRIPTIONS[activityType],
                created_at: now,
                updated_at: now,
            });

            const activities = listActivityDetailsRowsByProjectUuidAndType(appDatabase.db, projectId, activityType)
                .map(mapActivityDetailsRow);

            logger.info("Created activity", {
                correlationId: ctx.correlationId,
                projectId,
                corpusId: contextRow.corpus_id,
                activityId,
                activityType,
                activityName,
            });

            return {
                projectId: contextRow.project_id,
                corpusId: contextRow.corpus_id,
                corpusName: contextRow.corpus_name,
                binaryFilesPath: contextRow.binary_files_path,
                activities,
            };
        });
    } finally {
        appDatabase.close();
    }
}

function mapActivityDetailsRow(row: {
    activity_id: string;
    activity_name: string;
    activity_type: string;
    activity_type_display_name: string;
    description: string;
}): ActivityDetails {
    return {
        activityId: row.activity_id,
        activityName: row.activity_name,
        activityType: row.activity_type as ActivityType,
        activityTypeDisplayName: row.activity_type_display_name,
        description: row.description,
    };
}
