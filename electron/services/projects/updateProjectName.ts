import type { UpdateProjectNameRequest, UpdateProjectNameResponse } from "@electron/ipc/contracts/projects.contracts";
import type { RequestContext } from "@electron/core/requestContext";
import { raiseAppError } from "@electron/core/appException";
import { createAppDatabase } from "@electron/db/appDatabase";
import {
    findProjectRowByUuid,
    updateProjectNameRow,
} from "@electron/db/repositories/projectRepositories";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { logger } from "@electron/services/logger";

export async function updateProjectName(
    request: UpdateProjectNameRequest,
    ctx: RequestContext
): Promise<UpdateProjectNameResponse> {
    const projectName = requireNonEmptyString(request.projectName, "Project name");

    logger.info("Starting updateProjectName process", {
        correlationId: ctx.correlationId,
        projectUuid: request.projectUuid,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const existingProject = findProjectRowByUuid(appDatabase.db, request.projectUuid);

        if (!existingProject) {
            raiseAppError("RESOURCE_NOT_FOUND", "Project could not be found.");
        }

        updateProjectNameRow(appDatabase.db, request.projectUuid, projectName);

        logger.info("Project name updated", {
            correlationId: ctx.correlationId,
            projectUuid: request.projectUuid,
            projectName,
        });

        return {
            projectUuid: request.projectUuid,
            projectName,
        };
    } finally {
        appDatabase.close();
    }
}

function requireNonEmptyString(value: string, fieldName: string): string {
    const trimmed = value.trim();

    if (!trimmed) {
        raiseAppError("VALIDATION_MISSING_FIELD", `${fieldName} cannot be empty`);
    }

    return trimmed;
}
