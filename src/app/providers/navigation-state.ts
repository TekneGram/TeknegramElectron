import type { ActivityType } from "@/app/ports/activities.ports";

export type NavigationState =
 | { kind: "home" }
 | { kind: "settings" }
 | { kind: "activities"; projectId: string; projectName: string }
 | { kind: "analysis"; projectId: string; activityId: string; activityType: ActivityType, activityName: string, corpusName: string };

 export type NavigationAction =
 | { type: "go-home" }
 | { type: "go-settings" }
 | { type: "enter-activities"; projectId: string; projectName: string }
 | { type: "open-analysis"; projectId: string; activityId: string; activityType: ActivityType, activityName: string, corpusName: string };

export const initialNavigationState: NavigationState = { kind: "home" };

export function navigationReducer(
    state: NavigationState,
    action: NavigationAction,
): NavigationState {
    switch (action.type) {
        case "go-home":
            return { kind: "home" };
        case "go-settings":
            return { kind: "settings" };
        case "enter-activities":
            return { kind: "activities", projectId: action.projectId, projectName: action.projectName };
        case "open-analysis":
            return {
                kind: "analysis",
                projectId: action.projectId,
                activityId: action.activityId,
                activityType: action.activityType,
                activityName: action.activityName,
                corpusName: action.corpusName
            };
        default:
            return state;
    }
}
