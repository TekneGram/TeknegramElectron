export type CreateProjectRequest = {
    requestId: string;
    projectName: string;
    corpusName: string;
    folderPath: string;
    semanticsRulesPath?: string;
};

export type CreateProjectResponse = {
    projectUuid: string;
    corpusUuid: string;
    binaryFilesPathUuid: string;
    binaryFilesPath: string;
}

export type CancelCreateProjectRequest = {
    requestId: string;
}

export type CancelCreateProjectResponse = {
    requestId: string;
    message: string;
}

export type DeleteProjectRequest = {
    projectUuid: string;
}

export type DeleteProjectResponse = {
    projectUuid: string;
    deletedBinaryFilesPath: string;
}

export type UpdateProjectNameRequest = {
    projectUuid: string;
    projectName: string;
}

export type UpdateProjectNameResponse = {
    projectUuid: string;
    projectName: string;
}

export type GetCorpusMetadataRequest = {
    requestId: string;
    projectUuid: string;
}

export type GetCorpusMetadataResponse = {
    projectUuid: string;
    summary: string;
    source: "cache" | "generated" | "fallback";
}
