import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";

import { listProjects, type ProjectListItem } from "@electron/services/projects/listProjects";
import type {
    CreateProjectRequest,
    CreateProjectResponse,
    CancelCreateProjectRequest,
    CancelCreateProjectResponse,
    DeleteProjectRequest,
    DeleteProjectResponse,
    UpdateProjectNameRequest,
    UpdateProjectNameResponse,
} from "../contracts/projects.contracts";
import { createProject } from "@electron/services/projects/createProject";
import { cancelCreateProject } from "@electron/services/projects/cancelCreateProject";
import { deleteProject } from "@electron/services/projects/deleteProject";
import { updateProjectName } from "@electron/services/projects/updateProjectName";
import {
    createProjectSchema,
    cancelCreateProjectSchema,
    deleteProjectSchema,
    updateProjectNameSchema,
} from "../validationSchemas/projects.schemas";

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

    safeHandle<DeleteProjectRequest, DeleteProjectResponse>(
        "projects:delete",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(deleteProjectSchema, rawArgs);
            return deleteProject(args, ctx);
        }
    );

    safeHandle<UpdateProjectNameRequest, UpdateProjectNameResponse>(
        "projects:update-name",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(updateProjectNameSchema, rawArgs);
            return updateProjectName(args, ctx);
        }
    );
}
