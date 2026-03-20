import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type {
    ActivityRequest,
    ActivityResponse,
} from "../contracts/activities.contracts";
import { activityRequestSchema } from "../validationSchemas/activities.schemas";
import { requestActivities } from "@electron/services/activities/requestActivities";

export function RegisterActivityHandlers(): void {
    safeHandle<ActivityRequest, ActivityResponse>(
        "activities:request",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(activityRequestSchema, rawArgs);
            return requestActivities(args, ctx);
        }
    );
}
