import { z } from "zod";
import {
    ACTIVITY_TYPES,
    type CreateActivityRequest,
    type GetActivitiesRequest,
} from "../contracts/activities.contracts";

export const getActivitiesSchema: z.ZodType<GetActivitiesRequest> = z.object({
    projectId: z.string().uuid(),
});

export const createActivitySchema: z.ZodType<CreateActivityRequest> = z.object({
    projectId: z.string().uuid(),
    activityType: z.enum(ACTIVITY_TYPES),
});
