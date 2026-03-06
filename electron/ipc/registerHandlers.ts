import { safeHandle } from "./safeHandle";
// import { validateOrThrow } from "./validate";
import { listProjects, type ProjectListItem } from "@electron/services/projects/listProjects";

export function registerHandlers(): void {
    safeHandle<null, ProjectListItem[]>(
        "projects:list",
        async (_event, _args, ctx) => {
            return listProjects(ctx);
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
