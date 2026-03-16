import type { DeleteProjectRequest, DeleteProjectResponse, ProjectsPort } from "@/app/ports/projects.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";

export async function submitDeleteProject(
    port: ProjectsPort,
    request: DeleteProjectRequest
): Promise<DeleteProjectResponse> {
    const res: AppResult<DeleteProjectResponse> = await port.deleteProject(request);

    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "delete-project-failed" });
        throw new FrontAppError(res.error);
    }

    return res.value;
}
