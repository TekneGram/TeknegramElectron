import { createContext } from "react";
import type { ActivityType } from "@/app/ports/activities.ports";
import type { ActivityStartState } from "./activity-start-state";

export type ActivityStartContextValue = {
    state: ActivityStartState;
    openStartModal: (args: {
        projectId: string;
        projectName: string;
        activityType: ActivityType;
    }) => void;
    closeStartModal: () => void;
    confirmStartActivity: () => Promise<void>;
};

export const ActivityStartContext = createContext<ActivityStartContextValue | null>(null);