import type {
    ProjectsPort,
    UpdateProjectNameRequest,
    UpdateProjectNameResponse,
} from "@/app/ports/projects.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";

export async function submitUpdateProjectName(
    port: ProjectsPort,
    request: UpdateProjectNameRequest
): Promise<UpdateProjectNameResponse> {
    const res: AppResult<UpdateProjectNameResponse> = await port.updateProjectName(request);

    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "update-project-name-failed" });
        throw new FrontAppError(res.error);
    }

    return res.value;
}
