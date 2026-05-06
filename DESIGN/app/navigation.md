# Navigation

`navigation-state.ts` defines the app-wide view state.

- `home` is the default state.
- `settings` shows the settings screen.
- `activities` stores the selected `projectId` and `projectName`.
- `analysis` stores the selected `activityDetails` and `activityParentContext`.

`NavigationProvider` keeps this state in a reducer and exposes `navigationState` plus `dispatch` through context.

`MainView` reads `navigationState` with `useNavigation()` and renders one screen at a time.

- `home` renders `HomeView`.
- `settings` renders `SettingsView`.
- `activities` renders `ActivitiesView`.
- `analysis` renders `AnalysisView`.

The header navigation buttons dispatch `go-home` and `go-settings`.

`ProjectsList` dispatches `enter-activities` when a project is selected.

`ActivityCard` dispatches `open-analysis` when the user enters an activity.

`ActivitiesView` and `AnalysisView` guard against the wrong state kind and return `null` when they are not active.
