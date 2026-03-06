import type { ProjectListItem, ProjectsPort } from "@/app/ports/projects.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";

export async function listProjects(port: ProjectsPort): Promise<ProjectListItem[]> {
    const res: AppResult<ProjectListItem[]> = await port.listProjects();
    if(!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "projects-list-failed" });
        throw new Error(res.error.userMessage);
    }
    return res.value;
}