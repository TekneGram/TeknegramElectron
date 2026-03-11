import type {
    PickCorpusFolderRequest,
    PickCorpusFolderResponse
} from "@electron/ipc/contracts/system.contracts"
import { SystemDialogsPort } from "@electron/infrastructure/ports/systemDialogs.port";

export async function pickCorpusFolder(
    _request: PickCorpusFolderRequest,
    dialogs: SystemDialogsPort
): Promise<PickCorpusFolderResponse> {
    void _request;

    const result = await dialogs.openCorpusFolderDialog();

    return {
        folderPath: result.folderPath,
    };
}