## Journey implemented

The app starts on the home view.

- It loads the user’s projects.
- If no projects exist, it shows a welcome screen and a `Start New Project` button.
- If projects exist, it shows `ProjectsList`.

Projects are containers. They are the first level of navigation.

- A project groups the corpus work for one dataset.
- Selecting `Enter Project` moves the app into the activities view for that project.

Activities are the second level of navigation inside a project.

- `ActivitiesView` loads the activities for the selected project.
- If no activities exist, it shows the activity creation options.
- If activities exist, it shows `Activities` with one card per activity.

The activity types that can be created are:

- `explore_activities`
- `lb_activities`

Creating an activity opens a confirmation modal.

- After creation, the app shows a short transition state.
- Then it returns to the activities list.

From an activity card, the user can enter analysis.

- That dispatches `open-analysis`.
- The app switches to the analysis view for the selected activity.

