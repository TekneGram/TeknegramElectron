import type { AppResult } from "../types/result";

export interface ProjectListItem {
    uuid: string;
    projectName: string;
    createdAt: string;
}

export interface CreateProjectRequest {
    requestId: string;
    projectName: string;
    corpusName: string;
    folderPath: string;
    semanticsRulesPath?: string;
}

export interface CreateProjectResponse {
    projectUuid: string;
    corpusUuid: string;
    binaryFilesPathUuid: string;
    binaryFilesPath: string;
}

export interface ProjectsPort {
    listProjects(): Promise<AppResult<ProjectListItem[]>>
    createProject(request: CreateProjectRequest): Promise<AppResult<CreateProjectResponse>>
}