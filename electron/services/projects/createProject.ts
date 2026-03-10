
// This service should orchestrate the whole process of creating a new project
// 1. Accept the request
// 2. Validate the request
// 3. Generate IDs and timestamps
// 4. Decide output path for cpp generated binaries
// 5. Build the JSON request for the native process
// 6. Run the native process: if fail: log, throw error, do not write db rows
// 7. If native process is success: insert project, corpus and corpus_files_path *in one transaction*
// 8. Return a typed response for the IPC.

import type { RequestContext } from "@electron/core/requestContext";
import { logger } from "@electron/services/logger";
import { NewProjectRow, NewCorpusRow, NewCorpusFilesPathRow } from "@electron/db/repositories/projectRepositories";
import { getRuntimeDbPath, getCorpusBinariesDir, getUdpipeModelPath } from "@electron/runtime/runtimePaths";
import type { NativeRunParams } from "@electron/services/nativeProcessFactory";
import NativeProcessRunner from "@electron/services/nativeProcessFactory";
import type { NativeRunResult } from "../nativeProcessRunner";
import { runInTransaction } from '@electron/db/sqlite';
import { createAppDatabase } from "@electron/db/appDatabase";
import { insertProject, insertCorpus, insertCorpusFilePath } from "@electron/db/repositories/projectRepositories";
import { raiseAppError } from "@electron/core/appException";
import { randomUUID } from 'node:crypto';
import fs from "node:fs";
import path from "node:path";
import type { CreateProjectRequest, CreateProjectResponse } from "@electron/ipc/contracts/projects.contracts";
import { PROJECTS_CREATE_PROGRESS_CHANNEL } from "@electron/ipc/contracts/progress.event.contracts";
import { projectServiceRegistry } from "../projectServiceRegistry";

type ValidatedCreateProjectRequest = {
    projectName: string;
    corpusName: string;
    folderPath: string;
    semanticsRulesPath?: string;
};

export async function createProject(request: CreateProjectRequest, ctx: RequestContext): Promise<CreateProjectResponse> {
    // Log the start of the process
    logger.info(
        "Starting createProject process", 
        {
            correlationId: ctx.correlationId,
            projectName: request.projectName,
            corpusName: request.corpusName,
        }
    )
    // Validation step calls helper function
    const validatedRequest = validateCreateProjectRequest(request);

    // Decide where the binaries should be stored based on corpus name and create the directory
    const corpusBinariesDir = getCorpusBinariesDir(validatedRequest.corpusName);
    fs.mkdirSync(corpusBinariesDir, { recursive: true });

    // Generate the IDs and timestamps for entry into SQL tables
    const projectRow: NewProjectRow = {
        uuid: randomUUID(),
        project_name: validatedRequest.projectName,
        created_at: new Date().toISOString(),
    };

    const corpusRow: NewCorpusRow = {
        uuid: randomUUID(),
        project_uuid: projectRow.uuid,
        corpus_name: validatedRequest.corpusName,
        created_at: new Date().toISOString(),
    };

    const corpusFilesPathRow: NewCorpusFilesPathRow = {
        uuid: randomUUID(),
        corpus_uuid: corpusRow.uuid,
        binary_files_path: corpusBinariesDir,
        created_at: new Date().toISOString(),
    };

    // Build the JSON for the native process
    const nativeRequest = {
        command: "buildCorpus",
        modelPath: getUdpipeModelPath(),
        inputPath: validatedRequest.folderPath,
        outputDir: corpusBinariesDir,
        semanticsRulesPath: validatedRequest.semanticsRulesPath ?? "",
    };
    const requestJSON = JSON.stringify(nativeRequest);

    // Prepare the result type used for logging
    type BuildCorpusProcessResult = {
        command: string;
        outputDir: string;
        inputPath: string;
        modelPath: string;
        semanticsRulesPath: string;
    };

    // Create the native runner parameters and process, then run it
    // For parameters, do not need argv and inputJson
    const nativeRunnerParameters: NativeRunParams = {
        executable: "corpus_build_pipeline",
        expectJsonLines: true,
        onProgress: (message) => {
            ctx.sendEvent(PROJECTS_CREATE_PROGRESS_CHANNEL, {
                requestId: request.requestId,
                correlationId: ctx.correlationId,
                message: message.message,
                percent: message.percent ?? 0,
            });
            logger.info("Corpus build progress", {
                correlationId: ctx.correlationId,
                percent: message.percent,
                message: message.message
            });
        },
    }

    // Register the runner, created here, in the ProjectServiceRegistry so it can be cancelled or cleaned up later
    const runner = NativeProcessRunner.create<BuildCorpusProcessResult>(nativeRunnerParameters);
    projectServiceRegistry.registerCreateProjectOperation({
        requestId: request.requestId,
        outputDir: corpusBinariesDir,
        cancel: () => runner.cancelProcess()
    });

    let nativeResult: NativeRunResult<BuildCorpusProcessResult>;
    try {
        nativeResult = await runner.runProcess(requestJSON);
    } catch (err) {
        try {
            fs.rmSync(corpusBinariesDir, { recursive: true, force: true });
        } catch {
            logger.warn("Corpus build cancelled/failed before metadata persistence", {
                correlationId: ctx.correlationId,
                outputDir: corpusBinariesDir
            })
        }
        throw err
    } finally {
        projectServiceRegistry.removeCreateProjectOperation(request.requestId)
    }

    // const nativeResult = await runner.runProcess(requestJSON);
    // No need to check if nativeResult.result exists, since this is checked in runProcess
    logger.info("Corpus build completed", {
        correlationId: ctx.correlationId,
        outputDir: corpusBinariesDir
    });
    

    

    // Run transaction inserts into the database
    const appDatabase = createAppDatabase(getRuntimeDbPath());

    try {
        runInTransaction(appDatabase.db, () => {
            insertProject(appDatabase.db, projectRow);
            insertCorpus(appDatabase.db, corpusRow);
            insertCorpusFilePath(appDatabase.db, corpusFilesPathRow)
        });
    } catch (err) {
        // Clean up generated corpus directory if the database transaction fails
        try {
            fs.rmSync(corpusFilesPathRow.binary_files_path, { recursive: true, force: true });
        } catch {
            // Log with a warning if cleanup fails
            logger.warn("Corpus binaries failed to be deleted", {
                correlationId: ctx.correlationId,
                outputDir: corpusBinariesDir
            });
        }
        // Raise the error if database transaction fails.
        raiseAppError(
            "DB_QUERY_FAILED",
            "Failed to insert corpus metadata into database",
            err instanceof Error ? err.stack : undefined
        );
    } finally {
        appDatabase.close();
    }

    return {
        projectUuid: projectRow.uuid,
        corpusUuid: corpusRow.uuid,
        binaryFilesPathUuid: corpusFilesPathRow.uuid,
        binaryFilesPath: corpusFilesPathRow.binary_files_path
    }
}

// Helper functions for validation
function requireNonEmptyString(value: string, fieldName: string): string {
    const trimmed = value.trim();

    if(!trimmed) {
        raiseAppError("VALIDATION_MISSING_FIELD", `${fieldName} cannot be empty`)
    }

    return trimmed;
}

function validateCreateProjectRequest(request: CreateProjectRequest): ValidatedCreateProjectRequest {
    const projectName = requireNonEmptyString(request.projectName, "Project name");
    const corpusName = requireNonEmptyString(request.corpusName, "Corpus name");
    const folderPath = requireNonEmptyString(request.folderPath, "Folder path");
    const semanticsRulesPath = 
        request.semanticsRulesPath !== undefined
            ? requireNonEmptyString(request.semanticsRulesPath, "Semantics rules path")
            : undefined;

    // Check the folder of corpus files exists.
    if(!fs.existsSync(folderPath)) {
        raiseAppError("FS_NOT_FOUND", "A folder full of corpus files must actually exist on the system.");
    }

    // Check it is actually a directory.
    if (!fs.statSync(folderPath).isDirectory()) {
        raiseAppError(
            "VALIDATION_INVALID_PAYLOAD", 
            "The path to the folder you provided is not a folder.",
        );
    }
    
    // Check the semantics rules path exists
    if (semanticsRulesPath && !fs.existsSync(semanticsRulesPath)) {
        raiseAppError("FS_NOT_FOUND", "Semantic rules file must actually exist.");
    }

    // Check the semantics rule path is a file.
    if (semanticsRulesPath && !fs.statSync(semanticsRulesPath).isFile()) {
        raiseAppError(
            "VALIDATION_INVALID_PAYLOAD",
            "The file provided for semantic rules is not a file.",
        );
    }

    // Check the semantics rules file is a tsv file.
    if (semanticsRulesPath && path.extname(semanticsRulesPath).toLowerCase() !== ".tsv") {
        raiseAppError(
            "VALIDATION_INVALID_PAYLOAD",
            "The file type for semantic rules must be a tsv file"
        );
    }

    // All validations pass, so we can now create the ValidatedRequest object
    return {
        projectName: projectName,
        corpusName: corpusName,
        folderPath: folderPath,
        semanticsRulesPath: semanticsRulesPath
    };
    
}