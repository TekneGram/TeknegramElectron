Frontend overview

Renderer flow to electron:
UI -> hook -> React Query -> service -> port -> adapter -> backend/external system

Return flow
backend -> adapter -> port-shaped result -> service -> React Query state -> hook -> UI

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
  - When implementing a new frontend feature, start in `src/features/AGENTS.md` and consult `src/app/AGENTS.md`
  when the feature needs new ports/adapters/contracts.
  - If shared state starts crossing distant shell regions and looks domain-level, consult `src/layout/AGENTS.md`
  and consider whether a provider is needed.

Testing:
- Put frontend unit/local tests near the code they verify, typically in folder-level `__tests__`.
- Put frontend integration tests in `src/test/integration`.
- Put full app end-to-end tests in root `test/e2e`.
- Consult each subfolder `AGENTS.md` for domain-specific test expectations and quirks.
