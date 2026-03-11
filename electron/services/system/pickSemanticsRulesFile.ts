import { PickSemanticsRulesFileRequest, PickSemanticsRulesFileResponse } from '@electron/ipc/contracts/system.contracts';
import type { SystemDialogsPort } from '@electron/ports/systemDialogs.port';

export async function pickSemanticsRulesFile(
    _request: PickSemanticsRulesFileRequest,
    dialogs: SystemDialogsPort
): Promise<PickSemanticsRulesFileResponse> {
    void _request;

    const result = await dialogs.openSemanticsRulesFileDialog();

    return {
        filePath: result.filePath,
    };
}