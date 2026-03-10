import type { CancelCreateProjectResponse, CancelCreateProjectRequest, ProjectsPort } from "@/app/ports/projects.ports";
import type { AppResult } from "@/app/types/result"
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";

export async function submitCancelCreateProject(port: ProjectsPort, request: CancelCreateProjectRequest): Promise<CancelCreateProjectResponse> {
    const res: AppResult<CancelCreateProjectResponse> = await port.cancelCreateProject(request);
    if (res.ok) {
        return res.value;
    }
    
    if (res.error.kind !== "cancelled") {
        toastifyNotifier.error(res.error.userMessage, { id: "cancel-create-project-failed" });
    }

    throw new FrontAppError(res.error);
}