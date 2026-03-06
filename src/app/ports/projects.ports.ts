import type { AppResult } from "../types/result";

export interface ProjectListItem {
    uuid: string;
    projectName: string;
    createdAt: string;
}

export interface ProjectsPort {
    listProjects(): Promise<AppResult<ProjectListItem[]>>
}