# Frontend Architecture

## Purpose
The `src/` folder contains the renderer-side React application. It is organized around:

- app shell layout in `src/layout/*`
- feature-first UI and request logic in `src/features/*`
- frontend ports/adapters in `src/app/*`
- global styling and theme tokens in `src/styles/*`

The renderer should not talk directly to Electron IPC except through adapters.

## High-Level Flow
Typical renderer flow:

1. UI component triggers an action or loads data.
2. Feature hook or feature service calls a frontend adapter.
3. Adapter uses `invokeRequest(...)` to call Electron IPC.
4. Adapter returns `AppResult<T>`.
5. Feature service unwraps the result and throws or notifies as needed.
6. React Query or local component state drives rendering.

## Folder Roles

### `src/app/*`
Cross-cutting frontend infrastructure.

- `src/app/ports/*`
  - frontend-facing contracts for backend operations
  - examples: `ProjectsPort`, notification port

- `src/app/adapters/*`
  - concrete implementations of ports
  - the only place that should call `window.api.invoke(...)`
  - map backend `Result<T>` to frontend `AppResult<T>`

- `src/app/providers/*`
  - cross-cutting app state providers
  - example: `ThemeProvider`

- `src/app/types/*`
  - shared frontend types such as `AppResult`, theme types, etc.

## Feature Structure
Feature code lives under `src/features/*`.

Each feature can contain:

- UI components
- request hooks
- feature-local services
- feature-local CSS
- local UI state hooks

Examples:

- `src/features/ProjectsTinyView/*`
  - small project selector / new project entrypoint
  - React Query hook for listing projects
  - feature service for unwrapping adapter results

- `src/features/CreateProjectModal/*`
  - modal UI for starting a new project
  - form logic
  - picker integration
  - submit logic

## Layout Layer
Files under `src/layout/*` define the app shell and should stay structurally focused.

Current shell pieces:

- `Header`
- `Sidebar`
- `MainView`
- `ChatInterface`
- `WindowPane`

Rules:

- layout components compose feature components
- layout components should not own backend access unless there is a strong reason
- feature components should encapsulate feature logic and branching where possible

Example:

- `Header` hosts `ProjectsTinyView` and `ThemeToggle`
- `MainView` renders the welcome state and hosts modal overlays

## State Ownership Rules

### Local UI State
Use local `useState` or a small custom hook when the state belongs to one area.

Examples:

- open/close state for a modal
- selected item in a local dropdown
- form field values

### Shared UI State
If multiple sibling layout areas need the same UI state, lift it to their nearest common parent.

Example:

- modal open/close state should live in a common parent such as `WindowPane` if both `Header` and `MainView` can open it

Do not assume calling the same custom hook in two components shares state. It creates separate state instances unless backed by context.

### App-Wide State
Use a provider only when the state is genuinely cross-cutting.

Example:

- theme state belongs in `ThemeProvider`

## Data Fetching
Use React Query for backend request state.

Pattern:

1. adapter returns `AppResult<T>`
2. feature service unwraps it
3. feature hook calls the service with `useQuery`
4. hook returns loading/error/data state to UI

Example:

- `useListProjectsQuery()` loads project list
- components branch on:
  - `isLoading`
  - `isError`
  - `data`

Guidelines:

- do not return `undefined` to represent request failure from feature services
- throw on failure so React Query can manage error state
- use stable query keys like `["projects"]`
- invalidate queries after successful mutations

## Mutation Pattern
For create/update/delete flows:

1. UI gathers input
2. feature service calls adapter mutation
3. feature service unwraps `AppResult`
4. on success, invalidate relevant React Query keys
5. on failure, notify user

Examples:

- create project from `CreateProjectModal`
- invalidate `["projects"]` after success

## Notifications
Notifications are handled through the notifier adapter, not directly by components everywhere.

File:

- `src/app/adapters/notifications.ts`

Pattern:

- feature service detects failure
- feature service calls `toastifyNotifier.error(...)`
- feature hook/UI remains relatively clean

## Theme System
Theme is an app-level concern.

Files:

- `src/app/providers/ThemeProvider.tsx`
- `src/app/providers/useTheme.ts`
- `src/styles/theme.css`
- `src/styles/fonts.css`

Rules:

- `ThemeProvider` owns theme preference / resolved theme
- active theme is applied to `document.documentElement`
- CSS variables define colors and design tokens
- components should consume tokens, not hardcoded colors

Typography:

- IBM Plex Sans is the main UI font
- Space Grotesk is used for display headings

## Styling Rules

### Global Style Files
- `src/styles/theme.css`
  - theme tokens
  - global font and color usage

- `src/styles/layout.css`
  - app shell layout
  - shared shell-level styles

- `src/styles/fonts.css`
  - local font-face declarations

### Feature Style Files
Feature-specific styling should live beside the feature when possible.

Examples:

- `ThemeToggle.css`
- `CreateProjectModal.css`
- `projectsTinyView.css`

Do not put feature-specific styling into `layout.css` unless it truly belongs to the app shell.

## Modal Pattern
Modals are best treated as feature components rendered from a shared owner.

Pattern:

1. common parent owns `modalIsOpen`
2. buttons receive `openModal` via props
3. owner renders modal once
4. modal is a fixed overlay with:
   - backdrop
   - centered panel
   - close button

Modal components should stop click propagation inside the panel so backdrop click can close the modal.

## Contracts With Backend
Frontend request/response shapes should align with Electron IPC contracts.

Renderer side:

- ports/adapters define frontend-facing contracts
- Electron side:
  - `electron/ipc/contracts/*` defines backend IPC contracts

Keep these aligned deliberately. Do not let request/response shapes drift.

## Recommended Frontend Pattern For A New Feature

1. Create a feature folder in `src/features/<FeatureName>/`
2. Add feature UI component(s)
3. Add feature CSS if needed
4. Add feature hook(s) for data loading or form state
5. Add feature service(s) to unwrap adapters and notify on failure
6. Add or extend frontend ports/adapters
7. Use React Query for backend request state
8. Lift local UI state only as high as needed

## Core Rules
- Do not use `window.api` directly in components.
- Keep backend access inside adapters.
- Keep feature orchestration in feature services/hooks, not scattered in layout components.
- Use React Query for request state.
- Lift shared local UI state to the nearest common parent.
- Use providers only for genuinely cross-cutting state.
- Use theme tokens and local fonts instead of hardcoded styling.
