# Frontend Feature Template

Use this pattern when adding a new renderer feature under `src/features/*`.

## Suggested Folder Shape

```text
src/features/<FeatureName>/
  <FeatureName>.tsx
  <featureName>.css
  hooks/
    use<FeatureName>Query.ts
    use<FeatureName>Form.ts
  services/
    <featureName>.service.ts
```

Only create the files you actually need.

## Responsibilities

### Feature Component
File:

- `src/features/<FeatureName>/<FeatureName>.tsx`

Purpose:

- render feature UI
- consume hooks
- receive props from layout/app shell if needed

Keep it focused on rendering and user interaction.

### Feature CSS
File:

- `src/features/<FeatureName>/<featureName>.css`

Purpose:

- feature-specific styling
- keep shell/global styles out of this file

Use theme tokens instead of hardcoded colors where possible.

### Feature Hooks
Files:

- `hooks/use<FeatureName>Query.ts`
- `hooks/use<FeatureName>Form.ts`

Purpose:

- React Query request state
- local form state
- local UI state that belongs to the feature

Examples:

- loading backend data
- managing modal form values
- submit state / validation messages

### Feature Services
File:

- `services/<featureName>.service.ts`

Purpose:

- call frontend adapters
- unwrap `AppResult<T>`
- notify on failure
- throw on error for React Query when appropriate

Feature services should not call `window.api` directly.

## Typical Data-Loading Flow

1. Adapter returns `AppResult<T>`
2. Feature service unwraps result
3. Feature hook calls service with `useQuery`
4. Feature component renders from `data`, `isLoading`, `isError`

Example shape:

```ts
const result = await adapter.listSomething();

if (!result.ok) {
  notifier.error(result.error.userMessage, { id: "something-failed" });
  throw new Error(result.error.userMessage);
}

return result.value;
```

## Typical Mutation Flow

1. Feature form collects values
2. Feature service calls adapter mutation
3. On success, invalidate React Query keys
4. On failure, notify user

Examples:

- create project
- rename project
- delete corpus

## State Ownership Rules

- If state belongs only to the feature, keep it inside the feature.
- If multiple sibling layout areas need the same state, lift it to the nearest common parent.
- Do not assume calling the same custom hook in two places shares state.
- Use a provider only for truly cross-cutting state.

## Integration Checklist

1. Add or reuse a frontend port in `src/app/ports/*`
2. Add or reuse an adapter in `src/app/adapters/*`
3. Create feature service(s)
4. Create feature hook(s)
5. Render feature component from layout or another feature
6. Invalidate queries after successful mutations
7. Keep styles local unless they belong to the shell

## Example Minimal Feature

```text
src/features/ProjectsTinyView/
  ProjectsTinyView.tsx
  projectsTinyView.css
  hooks/
    useProjectsQuery.ts
  services/
    projects.tinyview.service.ts
```

## Core Rules

- Do not use `window.api` in feature components.
- Keep backend calls inside adapters.
- Keep feature orchestration inside feature services/hooks.
- Prefer React Query for backend request state.
- Prefer local feature CSS over global CSS for feature-specific UI.
