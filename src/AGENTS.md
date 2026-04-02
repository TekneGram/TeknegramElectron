Frontend overview

Renderer flow to electron:
UI -> hook -> React Query -> service -> port -> adapter -> backend/external system

Return flow
backend -> adapter -> port-shaped result -> service -> React Query state -> hook -> UI

Style system overview
- Global app-wide styles live in `src/styles/*`.
- `src/main.tsx` loads the global foundation styles, especially `fonts.css` and `theme.css`.
- Shared visual primitives are split by concern in `src/styles/*`, for example:
  - `theme.css` for tokens/theme variables
  - `fonts.css` for font setup
  - `layout.css` for shell/layout primitives
  - `button-styles.css`, `badge-style.css`, `forms.css`, `tool-tip.css`, `loading.css`, `shells.css`, `text-style.css`, `dropzone.css` for reusable UI styling layers
- Feature-local and layout-local styles live next to the owning code and are imported directly by that component or screen, for example:
  - `src/features/**/**/*.css`
  - `src/layout/**/styles/*.css`
- Components often combine one local stylesheet with several shared global styles. That is the intended pattern in this app.
- Do not move feature-specific styling into `src/styles/*` just because it is CSS; keep local styling with the feature or layout that owns it.
- Do not put business logic in stylesheet-driven wrapper components. CSS should support feature/layout ownership, not replace it.

  Folder responsibilities:
  - `src/app/*`: frontend infrastructure boundary. For adapters, ports, shared errors/results, and providers, see
  `src/app/AGENTS.md`.
  - `src/features/*`: feature implementation. For how to structure components, hooks, and services, see `src/
  features/AGENTS.md`.
  - `src/layout/*`: app shell composition and shared UI coordination. For layout responsibilities and state-
  lifting rules, see `src/layout/AGENTS.md`.

  Rules:
  - Do not call `window.api` directly outside adapters.
  - Do not put backend/infrastructure logic in layout components.
  - Import global shared CSS from `@/styles/*` when using shared UI primitives.
  - Import feature/layout-specific CSS from the local folder that owns the component.
  - If a style is reused across many unrelated features, it belongs in `src/styles/*`; if it is specific to one
  feature or one screen, keep it local.
  - When implementing a new frontend feature, start in `src/features/AGENTS.md` and consult `src/app/AGENTS.md`
  when the feature needs new ports/adapters/contracts.
  - If shared state starts crossing distant shell regions and looks domain-level, consult `src/layout/AGENTS.md`
  and consider whether a provider is needed.

Testing:
- Put frontend unit/local tests near the code they verify, typically in folder-level `__tests__`.
- Put frontend integration tests in `src/test/integration`.
- Put full app end-to-end tests in root `test/e2e`.
- Consult each subfolder `AGENTS.md` for domain-specific test expectations and quirks.
