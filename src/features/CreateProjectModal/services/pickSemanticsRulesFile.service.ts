import type { SystemPort, PickSemanticsRulesFileResponse } from "@/app/ports/system.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";

export async function pickSemanticsRulesFile(port: SystemPort): Promise<PickSemanticsRulesFileResponse> {
    const res: AppResult<PickSemanticsRulesFileResponse> = await port.pickSemanticsRulesFile();
    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "pick-semantics-rules-file-failed" });
        throw new Error(res.error.userMessage);
    }
    return res.value;
}