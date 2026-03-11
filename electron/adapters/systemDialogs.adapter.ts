import { BrowserWindow, dialog } from "electron";
import type {
    SystemDialogsPort,
    OpenFolderDialogResult,
    OpenSemanticsRulesDialogResult,
} from "@electron/ports/systemDialogs.port";

export const systemDialogsAdapter: SystemDialogsPort = {
    async openCorpusFolderDialog(): Promise<OpenFolderDialogResult> {
        const focusedWindow = BrowserWindow.getFocusedWindow();

        const result = focusedWindow
            ? await dialog.showOpenDialog(focusedWindow, {
                properties: ["openDirectory"],
                title: "Select Corpus Folder",
                buttonLabel: "Choose Folder"
            })
            : await dialog.showOpenDialog({
                properties: ["openDirectory"],
                title: "Select Corpus Folder",
                buttonLabel: "Choose Folder"
            });

        if (result.canceled || result.filePaths.length === 0) {
            return { folderPath: null };
        }

        return { folderPath: result.filePaths[0] };
    },

    async openSemanticsRulesFileDialog(): Promise<OpenSemanticsRulesDialogResult> {
        const focusedWindow = BrowserWindow.getFocusedWindow();

        const result = focusedWindow
            ? await dialog.showOpenDialog(focusedWindow, {
                properties: ["openFile"],
                title: "Select semantics rules tsv files",
                buttonLabel: "Choose Semantics Rules TSV file",
                filters: [{ name: "TSV Files", extensions: ["tsv"] }],
            })
            : await dialog.showOpenDialog({
                properties: ["openFile"],
                title: "Select semantics rules tsv file",
                buttonLabel: "Choose Semantics Rules TSV file",
                filters: [{ name: "TSV Files", extensions: ["tsv"] }],
            })
        
        if (result.canceled || result.filePaths.length === 0) {
            return { filePath: null };
        }

        return { filePath: result.filePaths[0] };
    }
}