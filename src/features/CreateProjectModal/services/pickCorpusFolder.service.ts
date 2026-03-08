import type { SystemPort, PickCorpusFolderResponse } from "@/app/ports/system.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";

export async function pickCorpusFolder(port: SystemPort): Promise<PickCorpusFolderResponse> {
    const res: AppResult<PickCorpusFolderResponse> = await port.pickCorpusFolder();
    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "pick-corpus-folder-failed" });
        throw new Error(res.error.userMessage);
    }
    return res.value;
}