import type { ActivitiesPort, GetActivitiesRequest, ActivityResponse } from "@/app/ports/activities.ports";
import type { AppResult } from "@/app/types/result";
import { toastifyNotifier } from "@/app/adapters/notifications";
import { FrontAppError } from "@/app/errors/FrontAppError";

export async function loadActivities(
    port: ActivitiesPort,
    request: GetActivitiesRequest,
): Promise<ActivityResponse> {
    const res: AppResult<ActivityResponse> = await port.getActivities(request);

    if (!res.ok) {
        toastifyNotifier.error(res.error.userMessage, { id: "activities-load-failed" });
        throw new FrontAppError(res.error);
    }

    return res.value;
}
