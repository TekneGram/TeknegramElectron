import type { CancelCreateProjectResponse, CancelCreateProjectRequest, ProjectsPort } from "@/app/ports/projects.ports";
import type { AppResult } from "@/app/types/result"
import { toastifyNotifier } from "@/app/adapters/notifications";

export async function submitCancelCreateProject(port: ProjectsPort, request: CancelCreateProjectRequest): Promise<CancelCreateProjectResponse> {
    const res: AppResult<CancelCreateProjectResponse> = await port.cancelCreateProject(request);
    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "cancel-create-project-failed" });
        throw new Error(res.error.userMessage);
    }
    return res.value;
}