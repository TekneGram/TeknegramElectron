import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";

import { listProjects, type ProjectListItem } from "@electron/services/projects/listProjects";
import type { CreateProjectRequest, CreateProjectResponse, CancelCreateProjectRequest, CancelCreateProjectResponse } from "../contracts/projects.contracts";
import { createProject } from "@electron/services/projects/createProject";
import { cancelCreateProject } from "@electron/services/projects/cancelCreateProject";
import { createProjectSchema, cancelCreateProjectSchema } from "../validationSchemas/projects.schemas";

export function RegisterProjectHandlers(): void {
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
    );
}