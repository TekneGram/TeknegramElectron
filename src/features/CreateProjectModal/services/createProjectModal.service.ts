import type { CreateProjectResponse, CreateProjectRequest, ProjectsPort } from "@/app/ports/projects.ports";
import type { AppResult } from "@/app/types/result"
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";

export async function submitCreateProject(port: ProjectsPort, request: CreateProjectRequest): Promise<CreateProjectResponse> {
    const res: AppResult<CreateProjectResponse> = await port.createProject(request);
    if (!res.ok) {
        if (res.error.kind !== "cancelled") {
            toastifyNotifier.error(res.error.userMessage, { id: "create-project-failed" });
        }

        throw new FrontAppError(res.error);
    }
    return res.value;
}
