export type OpenFolderDialogResult = {
    folderPath: string | null;
}

export type OpenSemanticsRulesDialogResult = {
    filePath: string | null;
}

export interface SystemDialogsPort {
    openCorpusFolderDialog(): Promise<OpenFolderDialogResult>;
    openSemanticsRulesFileDialog(): Promise<OpenSemanticsRulesDialogResult>;
}