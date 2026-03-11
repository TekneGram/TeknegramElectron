New features should follow these rules:

  - Put each feature in its own folder under src/features with colocated UI, hooks, services, and CSS.
  - Keep the top-level component as the composition layer: render subcomponents, wire handlers, own feature-local
    UI effects, and receive open/close callbacks from the parent.
  - Split hooks by concern, not by file-count convenience.
    Use separate hooks for form state, async mutation/query state, workflow orchestration, and OS/file-picker
    interactions.
  - Put backend or adapter calls in feature services, not directly in components.
    Services accept a port/adapter, unwrap AppResult, notify on failure, and throw on error.
  - Use React Query through a dedicated hook when the feature performs backend mutations or queries.
    Invalidate relevant query keys on success.
  - Use a workflow hook when the feature needs extra orchestration beyond the raw mutation.
    Examples: request IDs, progress events, cancellation state, special-case suppression.
  - Use local component state for UI-only concerns such as derived error text or temporary display state.
  - Keep adapters at the edge.
    Feature code calls services/hooks; services call ports/adapters; components do not call window.api.
  - Co-locate feature-specific styling beside the feature component or subcomponent.
  - Small subcomponents should be presentational and receive values/callbacks via props.
  - Form hooks should return structured objects like values, setters, errors, canSubmit, and resetForm.
  - Feature hooks should expose UI-ready state and actions, not raw infrastructure details.
  - Notifications are triggered below the component level, typically in services or workflow hooks, through the
    notifier adapter.
  - Errors should be thrown from services rather than encoded as undefined/null failure results.
  - For long-running flows, track progress and cancellation explicitly in the feature hook, and filter events to
    the active request.

Testing:
  - Write feature unit/local tests in the feature folder, typically under `__tests__`.
  - Good default coverage is: feature services, feature hooks, and top-level component branching/interaction.
  - Use component tests for rendering and user interactions; use hook tests for workflow/state logic.
  - Keep cross-feature or cross-layer tests out of feature `__tests__`; those belong in integration or e2e locations.
  - Hook and component tests use the DOM test environment.
  - When mocking hooks in tests, do not name plain mock functions with a `use*` prefix; the React Hooks linter treats those as hooks and may report false rule violations.
