import { safeHandle } from "./safeHandle";
// import { validateOrThrow } from "./validate";
// import { runFeatureTemplate } from "../services/featureServiceTemplate";

export function registerHandlers(): void {
    // Minimal starter channel used as a health check.
    safeHandle<undefined, { nowIso: string }>("system:ping", async () => {
        return { nowIso: new Date().toISOString() };
    });

    /**
     * Example feature channel template:
     *
     * safeHandle<unknown, FeatureTemplateResponse>("feature:template", async (_event, rawArgs, ctx) => {
     *   // const args = validateOrThrow(featureSchema, rawArgs);
     *   // return runFeatureTemplate(args, ctx);
     * });
     */
}
