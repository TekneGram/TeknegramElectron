import { dialog, BrowserWindow } from "electron";
import type {
    PickSemanticsRulesFileRequest,
    PickSemanticsRulesFileResponse
} from "@electron/ipc/contracts/system.contracts";

export async function pickSemanticsRulesFile(
    _request: PickSemanticsRulesFileRequest
): Promise<PickSemanticsRulesFileResponse> {
    void _request;
    const focusedWindow = BrowserWindow.getFocusedWindow();

    const result = focusedWindow
        ? await dialog.showOpenDialog(focusedWindow, {
            properties: ["openFile"],
            title: "Select semantics rules tsv file",
            buttonLabel: "Choose Semantics Rules TSV file",
            filters: [
                { name: "TSV Files", extensions: ["tsv"]}
            ],
        })
        : await dialog.showOpenDialog({
            properties: ["openFile"],
            title: "Select semantics rules tsv file",
            buttonLabel: "Choose Semantics Rules TSV file",
            filters: [
                { name: "TSV Files", extensions: ["tsv"]}
            ],
        })

    if (result.canceled || result.filePaths.length === 0) {
        return { filePath: null };
    }

    return {
        filePath: result.filePaths[0],
    }
    
}