export type NavigationState =
 | { kind: "home" }
 | { kind: "settings" }
 | { kind: "activities"; projectId: string }
 | { kind: "analyses"; activityId: string };