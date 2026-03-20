import type { AppResult } from "../types/result";

export type ActivityType = "lb_activities";

export type ActivityRequestType = "get" | "create";

export type ActivityRequest = {
    projectId: string;
    activityType: ActivityType;
    requestType: ActivityRequestType;
};

export type ActivityDetails = {
    activityId: string;
    activityName: string;
    activityType: ActivityType;
    activityTypeDisplayName: string;
    description: string;
};

export type ActivityResponse = {
    corpusId: string;
    projectId: string;
    corpusName: string;
    binaryFilesPath: string;
    activities: ActivityDetails[];
};

export interface ActivitiesPort {
    getActivities(request: ActivityRequest): Promise<AppResult<ActivityResponse>>;
    createActivity(request: ActivityRequest): Promise<AppResult<ActivityResponse>>;
}
