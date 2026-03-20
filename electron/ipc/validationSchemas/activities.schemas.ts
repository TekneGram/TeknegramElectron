import { z } from "zod";
import {
    ACTIVITY_REQUEST_TYPES,
    ACTIVITY_TYPES,
    type ActivityRequest,
} from "../contracts/activities.contracts";

export const activityRequestSchema: z.ZodType<ActivityRequest> = z.object({
    projectId: z.string().uuid(),
    activityType: z.enum(ACTIVITY_TYPES),
    requestType: z.enum(ACTIVITY_REQUEST_TYPES),
});
