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

export interface CancelCreateProjectRequest {
    requestId: string;
}

export interface CancelCreateProjectResponse {
    requestId: string;
    message: string;
}

export interface DeleteProjectRequest {
    projectUuid: string;
}

export interface DeleteProjectResponse {
    projectUuid: string;
    deletedBinaryFilesPath: string;
}

export interface UpdateProjectNameRequest {
    projectUuid: string;
    projectName: string;
}

export interface UpdateProjectNameResponse {
    projectUuid: string;
    projectName: string;
}

export interface GetCorpusMetadataRequest {
    requestId: string;
    projectUuid: string;
}

export interface GetCorpusMetadataResponse {
    projectUuid: string;
    summary: string;
    source: "cache" | "generated" | "fallback";
}

export interface ProjectsPort {
    listProjects(): Promise<AppResult<ProjectListItem[]>>
    createProject(request: CreateProjectRequest): Promise<AppResult<CreateProjectResponse>>
    cancelCreateProject(request: CancelCreateProjectRequest): Promise<AppResult<CancelCreateProjectResponse>>
    deleteProject(request: DeleteProjectRequest): Promise<AppResult<DeleteProjectResponse>>
    updateProjectName(request: UpdateProjectNameRequest): Promise<AppResult<UpdateProjectNameResponse>>
    getCorpusMetadata(request: GetCorpusMetadataRequest): Promise<AppResult<GetCorpusMetadataResponse>>
}
