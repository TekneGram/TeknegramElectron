export const ACTIVITY_TYPES = [
    "lb_activities",
    "vocab_activities",
    "collocation_activities",
    "dependency_activities",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

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
