export type NavigationState =
 | { kind: "home" }
 | { kind: "settings" }
 | { kind: "activities"; projectId: string; projectName: string }
 | { kind: "analyses"; activityId: string };

 export type NavigationAction =
 | { type: "go-home" }
 | { type: "go-settings" }
 | { type: "enter-activities"; projectId: string; projectName: string }
 | { type: "open-analyses"; activityId: string };

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
        case "open-analyses":
            return { kind: "analyses", activityId: action.activityId };
        default:
            return state;
    }
}