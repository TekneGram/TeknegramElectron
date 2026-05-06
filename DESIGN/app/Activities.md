# Activities

`Activities` renders the activity workspace for the selected corpus.

- It shows the corpus name and the number of available activities.
- It maps the `activities` array into a grid of cards.
- It returns `ActivityCard` for each activity.

`ActivityCard` is the only feature component it uses from `src/features`.

- It displays the activity name, type, and description.
- It provides the `Enter` action.
- That action dispatches `open-analysis` so the app moves into the analysis view for the chosen activity.

The activity types that can be created are:

- `explore_activities`
- `lb_activities`

`Activities` is the presentational grid for loaded activities.

`ActivitiesView` is the layout-level controller.

- It reads the current navigation state.
- It fetches activities for the selected project.
- It shows loading, error, empty-state, and transition UIs.
- It renders `Activities` only when activities are available.
- It also mounts `ActivitiesStartModal` for creating new activities.
