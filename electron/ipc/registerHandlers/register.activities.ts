import { safeHandle } from "../safeHandle";
import { validateOrThrow } from "../validate";
import type {
    ActivityResponse,
    CreateActivityRequest,
    GetActivitiesRequest,
} from "../contracts/activities.contracts";
import { createActivitySchema, getActivitiesSchema } from "../validationSchemas/activities.schemas";
import { createActivity, getActivities } from "@electron/services/activities/requestActivities";

export function RegisterActivityHandlers(): void {
    safeHandle<GetActivitiesRequest, ActivityResponse>(
        "activities:get",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(getActivitiesSchema, rawArgs);
            return getActivities(args, ctx);
        }
    );

    safeHandle<CreateActivityRequest, ActivityResponse>(
        "activities:create",
        async (_event, rawArgs, ctx) => {
            const args = validateOrThrow(createActivitySchema, rawArgs);
            return createActivity(args, ctx);
        }
    );
}
