import type { ActivitiesPort, ActivityRequest, ActivityResponse } from "@/app/ports/activities.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";

export async function submitActivityCreation(
    port: ActivitiesPort,
    request: ActivityRequest,
): Promise<ActivityResponse> {
    const res: AppResult<ActivityResponse> = await port.createActivity(request);

    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "activities-create-failed" });
        throw new FrontAppError(res.error);
    }

    return res.value;
}
