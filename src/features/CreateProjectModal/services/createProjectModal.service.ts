import type { CreateProjectResponse, CreateProjectRequest, ProjectsPort } from "@/app/ports/projects.ports";
import type { AppResult } from "@/app/types/result"
import { toastifyNotifier } from "@/app/adapters/notifications";

export async function submitCreateProject(port: ProjectsPort, request: CreateProjectRequest): Promise<CreateProjectResponse> {
    const res: AppResult<CreateProjectResponse> = await port.createProject(request);
    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "create-project-failed" });
        throw new Error(res.error.userMessage);
    }
    return res.value;
}