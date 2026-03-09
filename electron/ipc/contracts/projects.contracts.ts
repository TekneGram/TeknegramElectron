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