import type { ProjectListItem, ProjectsPort } from "@/app/ports/projects.ports";
import { invokeRequest } from "./invokeRequest";

export const projectsAdapter: ProjectsPort = {
    async listProjects() {
        return invokeRequest<null, ProjectListItem[]>("projects:list", null);
    }
}