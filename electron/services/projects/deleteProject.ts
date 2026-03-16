import fs from "node:fs";
import path from "node:path";
import type { DeleteProjectRequest, DeleteProjectResponse } from "@electron/ipc/contracts/projects.contracts";
import type { RequestContext } from "@electron/core/requestContext";
import { logger } from "@electron/services/logger";
import { createAppDatabase } from "@electron/db/appDatabase";
import { runInTransaction } from "@electron/db/sqlite";
import { findProjectDeleteTargetRow, deleteProjectRow } from "@electron/db/repositories/projectRepositories";
import { getRuntimeDbPath, getCorpusDeletionStagingDir } from "@electron/runtime/runtimePaths";
import { raiseAppError } from "@electron/core/appException";

export async function deleteProject(request: DeleteProjectRequest, ctx: RequestContext): Promise<DeleteProjectResponse> {
    logger.info("Starting deleteProject process", {
        correlationId: ctx.correlationId,
        projectUuid: request.projectUuid,
    });

    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        const target = findProjectDeleteTargetRow(appDatabase.db, request.projectUuid);

        if (!target) {
            raiseAppError("RESOURCE_NOT_FOUND", "Project could not be found.");
        }

        const sourceDir = target.binary_files_path;

        if (!fs.existsSync(sourceDir)) {
            raiseAppError("FS_NOT_FOUND", "Project binaries could not be found.");
        }

        const stagedDir = getCorpusDeletionStagingDir(request.projectUuid);
        ensureParentDir(stagedDir);
        clearExistingStage(stagedDir, ctx);

        try {
            fs.renameSync(sourceDir, stagedDir);
        } catch (err) {
            raiseAppError(
                "FS_WRITE_FAILED",
                "Failed to prepare project binaries for deletion.",
                err instanceof Error ? err.stack : undefined
            );
        }

        try {
            runInTransaction(appDatabase.db, () => {
                deleteProjectRow(appDatabase.db, request.projectUuid);
            });
        } catch (err) {
            restoreStagedDirectory(stagedDir, sourceDir, ctx);
            raiseAppError(
                "DB_QUERY_FAILED",
                "Failed to delete project metadata from database.",
                err instanceof Error ? err.stack : undefined
            );
        }

        try {
            fs.rmSync(stagedDir, { recursive: true, force: true });
        } catch (err) {
            raiseAppError(
                "FS_WRITE_FAILED",
                "Project metadata was deleted, but binary cleanup failed.",
                err instanceof Error ? err.stack : undefined
            );
        }

        logger.info("Project deleted", {
            correlationId: ctx.correlationId,
            projectUuid: request.projectUuid,
            deletedBinaryFilesPath: sourceDir,
        });

        return {
            projectUuid: request.projectUuid,
            deletedBinaryFilesPath: sourceDir,
        };
    } finally {
        appDatabase.close();
    }
}

function ensureParentDir(targetPath: string): void {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

function clearExistingStage(stagedDir: string, ctx: RequestContext): void {
    if (!fs.existsSync(stagedDir)) {
        return;
    }

    logger.warn("Clearing stale staged delete directory", {
        correlationId: ctx.correlationId,
        stagedDir,
    });
    fs.rmSync(stagedDir, { recursive: true, force: true });
}

function restoreStagedDirectory(stagedDir: string, sourceDir: string, ctx: RequestContext): void {
    try {
        ensureParentDir(sourceDir);
        fs.renameSync(stagedDir, sourceDir);
    } catch (err) {
        logger.error("Failed to restore staged project binaries after DB delete failure", {
            correlationId: ctx.correlationId,
            stagedDir,
            sourceDir,
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
