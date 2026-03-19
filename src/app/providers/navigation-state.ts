export type NavigationState =
 | { kind: "home" }
 | { kind: "settings" }
 | { kind: "activities"; projectId: string }
 | { kind: "analyses"; activityId: string };

 export type NavigationAction =
 | { type: "go-home" }
 | { type: "go-settings" }
 | { type: "enter-activity"; projectId: string }
 | { type: "open-analysis"; activityId: string };

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
        case "enter-activity":
            return { kind: "activities", projectId: action.projectId };
        case "open-analysis":
            return { kind: "analyses", activityId: action.activityId };
        default:
            return state;
    }
}