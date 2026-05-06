# HomeView

`HomeView` is the landing screen for the main view.

- It fetches the project list with `useListProjectsQuery()`.
- It starts in `welcome` mode.
- It switches to `projects-list` when projects exist.
- It shows a `CreateSuccessTransition` after a new project is created.
- It waits 4 seconds in that transition, then refetches projects.
- It returns to `projects-list` if the refetch finds data.
- It returns to `welcome` if the refetch is still empty.
- It shows simple loading and error text while the query is pending or failed.

In `welcome` mode, it renders the Teknegram title, short copy, logo, and a `Start New Project` button.

The button calls `onOpenModal` so the parent can open the project creation modal.

When projects are present, it renders `ProjectsList` with the loaded data.

`ProjectsList` renders a project header and one `ProjectCard` per project.

- Each card gets the project data and a navigation callback.
- Clicking `Enter Project` dispatches `enter-activities` with the project id and name.
- That moves the app into the activities view for the selected project.

See Activities.md for details.