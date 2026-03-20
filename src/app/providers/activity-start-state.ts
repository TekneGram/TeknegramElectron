import type { ActivityType } from "@/app/ports/activities.ports";

export type ActivityStartPhase = 
    | "idle"
    | "confirming"
    | "creating"
    | "transitioning";

export type ActivityStartState = {
    phase: ActivityStartPhase;
    projectId: string | null;
    projectName: string | null;
    pendingActivityType: ActivityType | null;
    transitionActivityType: ActivityType | null;
};