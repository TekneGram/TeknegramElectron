export type NavigationState =
 | { kind: "home" }
 | { kind: "settings" }
 | { kind: "activities"; projectId: string }
 | { kind: "analyses"; activityId: string };

 export type NavigationAction =
 | { type: "go-home" }
 | { type: "go-settings" }
 | { type: "enter-project"; projectId: string }
 | { type: "open-analysis"; activityId: string };

