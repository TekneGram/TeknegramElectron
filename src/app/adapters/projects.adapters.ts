import type { 
    ProjectListItem, 
    CreateProjectRequest, 
    CreateProjectResponse, 
    CancelCreateProjectRequest,
    CancelCreateProjectResponse,
    ProjectsPort } from "@/app/ports/projects.ports";
import { invokeRequest } from "./invokeRequest";

export const projectsAdapter: ProjectsPort = {
    async listProjects() {
        return invokeRequest<null, ProjectListItem[]>("projects:list", null);
    },

    async createProject(request: CreateProjectRequest) {
        return invokeRequest<CreateProjectRequest, CreateProjectResponse>("projects:create", request);
    },

    async cancelCreateProject(request: CancelCreateProjectRequest) {
        return invokeRequest<CancelCreateProjectRequest, CancelCreateProjectResponse>("projects:create:cancel", request);
    }
}