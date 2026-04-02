import type { AppResult } from "../types/result";

export type ActivityType = "lb_activities" | "explore_activities";

export type GetActivitiesRequest = {
    projectId: string;
};

export type CreateActivityRequest = {
    projectId: string;
    activityType: ActivityType;
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

export type ActivityParentContext= Omit<ActivityResponse, "activities">;

export interface ActivitiesPort {
    getActivities(request: GetActivitiesRequest): Promise<AppResult<ActivityResponse>>;
    createActivity(request: CreateActivityRequest): Promise<AppResult<ActivityResponse>>;
}
