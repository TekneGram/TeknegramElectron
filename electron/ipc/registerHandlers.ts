import { safeHandle } from "./safeHandle";
// import { validateOrThrow } from "./validate";
import { listProjects, type ProjectListItem } from "@electron/services/projects/listProjects";
import { createProject } from "@electron/services/projects/createProject";
import { cancelCreateProject } from "@electron/services/projects/cancelCreateProject";
import type { CreateProjectRequest, CreateProjectResponse, CancelCreateProjectRequest, CancelCreateProjectResponse } from "./contracts/projects.contracts";
import { validateOrThrow } from "./validate";
import { createProjectSchema, cancelCreateProjectSchema } from "./validationSchemas/projects.schemas";
import { pickCorpusFolderSchema, pickSemanticsRulesFileSchema } from "./validationSchemas/system.schemas";
import type { PickCorpusFolderRequest, PickCorpusFolderResponse } from "./contracts/system.contracts";
import { pickCorpusFolder } from "@electron/services/system/pickCorpusFolder";
import type { PickSemanticsRulesFileRequest, PickSemanticsRulesFileResponse } from "./contracts/system.contracts";
import { pickSemanticsRulesFile } from "@electron/services/system/pickSemanticsRulesFile";

export function registerHandlers(): void {
    safeHandle<null, ProjectListItem[]>(
        "projects:list",
        async (_event, _args, ctx) => {
            return listProjects(ctx);
        }
    );

    safeHandle<CreateProjectRequest, CreateProjectResponse>(
        "projects:create",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(createProjectSchema, rawArgs);
            return createProject(args, ctx);
        }
    );

    safeHandle<CancelCreateProjectRequest,  CancelCreateProjectResponse>(
        "projects:create:cancel",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(cancelCreateProjectSchema, rawArgs);
            return cancelCreateProject(args, ctx);
        }
    )

    safeHandle<PickCorpusFolderRequest, PickCorpusFolderResponse>(
        "system:pick-corpus-folder",
        async (_event, rawArgs, _ctx) => {
            void _ctx;
            const args = validateOrThrow(pickCorpusFolderSchema, rawArgs);
            return pickCorpusFolder(args);
        }
    );

    safeHandle<PickSemanticsRulesFileRequest, PickSemanticsRulesFileResponse>(
        "system:pick-semantics-rules-file",
        async (_event, rawArgs, _ctx) => {
            void _ctx;
            const args = validateOrThrow(pickSemanticsRulesFileSchema, rawArgs);
            return pickSemanticsRulesFile(args);
        }
    )

    /**
     * Example feature channel template:
     *
     * safeHandle<unknown, FeatureTemplateResponse>("feature:template", async (_event, rawArgs, ctx) => {
     *   // const args = validateOrThrow(featureSchema, rawArgs);
     *   // return runFeatureTemplate(args, ctx);
     * });
     */
}
