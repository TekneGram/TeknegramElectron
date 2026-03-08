import { dialog, BrowserWindow } from "electron";
import type {
    PickCorpusFolderRequest,
    PickCorpusFolderResponse
} from "@electron/ipc/contracts/system.contracts";

export async function pickCorpusFolder(_request: PickCorpusFolderRequest): Promise<PickCorpusFolderResponse> {
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
    })

    if (result.canceled || result.filePaths.length === 0) {
        return { folderPath: null };
    }

    return {
        folderPath: result.filePaths[0],
    };
}