import { safeHandle } from "./safeHandle";
// import { validateOrThrow } from "./validate";
import { listProjects, type ProjectListItem } from "@electron/services/projects/listProjects";
import { createProject } from "@electron/services/projects/createProject";
import type { CreateProjectRequest, CreateProjectResponse } from "./contracts/projects.contracts";
import { validateOrThrow } from "./validate";
import { createProjectSchema } from "./validationSchemas/projects.schemas";

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

    /**
     * Example feature channel template:
     *
     * safeHandle<unknown, FeatureTemplateResponse>("feature:template", async (_event, rawArgs, ctx) => {
     *   // const args = validateOrThrow(featureSchema, rawArgs);
     *   // return runFeatureTemplate(args, ctx);
     * });
     */
}
