import type { RequestContext } from "../core/requestContext";
import { logger } from "./logger";

export type FeatureTemplateRequest = Record<string, unknown>;

export type FeatureTemplateResponse = {
    status: "ok";
    timestampIso: string;
};

/**
 * Starter template for request-scoped backend service logic.
 * Replace request/response types and implementation per feature.
 */
export async function runFeatureTemplate(
    request: FeatureTemplateRequest,
    ctx: RequestContext
): Promise<FeatureTemplateResponse> {
    logger.info("Feature template invoked", {
        correlationId: ctx.correlationId,
        keys: Object.keys(request),
    });

    return {
        status: "ok",
        timestampIso: new Date().toISOString(),
    };
}
