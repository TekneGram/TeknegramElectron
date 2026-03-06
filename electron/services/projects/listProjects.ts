import type { RequestContext } from "@electron/core/requestContext";
import { logger } from "@electron/services/logger";
import { createAppDatabase } from "@electron/db/appDatabase";
import { getRuntimeDbPath } from "@electron/runtime/runtimePaths";
import { listProjectRows } from "@electron/db/repositories/projectRepositories";

export type ProjectListItem = {
    uuid: string;
    projectName: string;
    createdAt: string;
}

export async function listProjects(ctx: RequestContext): Promise<ProjectListItem[]> {
    
    logger.info("Listing projects", {
        correlationId: ctx.correlationId,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const rows = listProjectRows(appDatabase.db);

        logger.info("Projects listed", {
            correlationId: ctx.correlationId,
            count: rows.length
        });

        return rows.map((row) => ({
            uuid: row.uuid,
            projectName: row.project_name,
            createdAt: row.created_at,
        }))
    } finally {
        appDatabase.close();
    }
}