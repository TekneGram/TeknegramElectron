export const ACTIVITY_REQUEST_TYPES = ["get", "create"] as const;
export type ActivityRequestType = (typeof ACTIVITY_REQUEST_TYPES)[number];

export const ACTIVITY_TYPES = ["lb_activities"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

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
