import { raiseAppError } from "@electron/core/appException";
import type {
    CancelCreateProjectRequest,
    CancelCreateProjectResponse
} from "@electron/ipc/contracts/projects.contracts";
import { projectServiceRegistry } from "../projectServiceRegistry";
import type { RequestContext } from "@electron/core/requestContext";
import { logger } from "@electron/services/logger";

export async function cancelCreateProject(
    request: CancelCreateProjectRequest,
    ctx: RequestContext
): Promise<CancelCreateProjectResponse> {
    const operation = projectServiceRegistry.getCreateProjectOperation(request.requestId);

    if (!operation) {
        raiseAppError(
            "VALIDATION_INVALID_STATE",
            "No active project creation operation was found for that request."
        );
    }

    logger.info("Cancel build project requested", {
        correlationId: ctx.correlationId,
        requestId: request.requestId
    });

    operation.cancel();
    return {
        requestId: request.requestId,
        message: "Project creation cancellation requested.",
    };
}