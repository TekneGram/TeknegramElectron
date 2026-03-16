 Renderer to Electron request flow
  - frontend adapter -> preload.ts -> ipc/registerHandlers/* -> ipc/validate.ts + ipc/validationSchemas/* ->
    services/*

  System UI capability flow
  - services/* -> infrastructure/ports/* -> infrastructure/adapters/* -> Electron APIs

  Database capability flow
  - services/* -> db/appDatabase.ts / db/sqlite.ts -> db/repositories/*

  Native process capability flow
  - services/* -> services/nativeProcessFactory.ts / services/nativeProcessRunner.ts -> native executable

  Reusable LLM subsystem flow
  - services/* -> llm/controllers/* -> llm/operations/* -> llm/providers/* -> external LLM provider

  Shared type layer
  - ipc/contracts/* defines the request, response, and event shapes used across the boundary

  Here are the rules for writing code in the electron folder:

`assets/`
  - Store bundled read-only resources needed by the app at runtime.
  - Good examples: seed database, model files, static templates.
  - Do not write generated runtime data here.
  - Do not put feature logic here.
  - In packaged builds, treat assets as read-only.
  - Access asset paths through runtime/runtimePaths.ts, not by hardcoding paths in services.

`bin/`
  - Store bundled native executables and bundled binary corpus resources.
  - bin/executables/* is for platform-specific shipped binaries.
  - bin/corpus-binaries/* may contain prebuilt sample/reference corpus binaries in development.
  - Do not treat this folder as general writable application storage policy; writable runtime paths should still
    be resolved through runtimePaths.ts.
  - Services should not hardcode paths into bin/; they should ask runtime helpers.

`core/`
  - Store shared backend-core types and primitives.
  - Good examples: error types, exception helpers, request context.
  - Keep this folder framework-light and reusable across services.
  - Do not put feature-specific orchestration here.
  - Do not put IPC registration, SQL, or Electron UI/platform code here.

`db/`
  - Own persistence setup and database access.
  - initializeDatabase.ts is for startup DB initialization only.
  - runMigrations.ts applies ordered SQL migrations.
  - sqlite.ts contains generic DB helpers only.
  - repositories/* contains table-oriented SQL operations only.
  - Repositories must stay dumb: no orchestration, no UUID generation, no path computation, no transaction policy.
  - Services own transaction boundaries and combine repository calls.

`infrastructure/`
  - Own Electron/platform capability boundaries used by services.
  - ports/* defines interfaces for platform capabilities.
  - adapters/* implements those interfaces with Electron APIs or other platform libraries.
  - Use this folder when direct Electron API access would otherwise spread through services.
  - Keep adapters thin and capability-focused.
  - Do not put business logic, IPC registration, or DB logic here.

`llm/`
  - Own reusable LLM-specific backend pipelines used by many services.
  - controllers/* is the orchestration entrypoint for LLM use cases.
  - operations/* contains use-case-specific LLM workflows below controllers.
  - policies/* centralizes provider/model defaults, limits, and fallback rules.
  - providers/* isolates provider-specific HTTP clients and provider registries.
  - schemas/* validates structured LLM outputs.
  - shared/* defines LLM subsystem DTOs and shared types.
  - tools/* contains tool/function-calling loop types and implementations.
  - Keep this subsystem independent from IPC and renderer concerns.
  - Retrieve credentials through injected interfaces; concrete secret storage belongs outside this subsystem.
  - Do not put Electron UI/platform calls directly in LLM controllers or operations.

`ipc/`
  - Own the transport boundary between renderer and Electron main.
  - contracts/* defines request/response/event DTOs.
  - validationSchemas/* defines Zod schemas for incoming raw payloads.
  - validate.ts performs boundary validation.
  - safeHandle.ts normalizes request-scoped success/failure into Result<T>.
  - registerHandlers/* groups channel registration by concern.
  - registerHandlers.ts should remain a thin composition entrypoint.
  - Keep handlers thin: validate, delegate to service, return result.

`runtime/`
  - Own environment-aware path and storage policy.
  - Resolve dev vs packaged locations here.
  - Centralize writable vs bundled read-only path decisions here.
  - bootstrapStorage.ts prepares runtime directories and first-run copies.
  - Do not hardcode filesystem policy elsewhere.
  - Services should ask runtime helpers for paths instead of constructing them manually.

`services/`
  - Own backend use-case orchestration.
  - Accept typed request data and RequestContext when needed.
  - Validate runtime/business constraints beyond IPC shape validation.
  - Call repositories, runtime helpers, native process runners, LLM controllers, and infrastructure ports/adapters.
  - Define transaction boundaries.
  - Log meaningful backend events.
  - Return typed response DTOs.
  - Do not register IPC handlers here.
  - Do not contain raw SQL unless there is a strong reason.
  - Do not become a dumping ground for direct platform API calls if those capabilities belong in infrastructure/.

`main.ts`
  - Startup/bootstrap only.
  - Initialize backend runtime concerns such as storage, database startup, handler registration, and window creation.
  - Do not put request-time feature orchestration or business logic here.

A compact summary for the whole backend is:
  - `ipc/` = transport boundary
  - `services/` = orchestration
  - `llm/` = reusable LLM subsystem
  - `db/` = persistence
  - `runtime/` = path/storage policy
  - `infrastructure/` = Electron/platform capability boundary
  - `core/` = shared backend primitives
  - `assets/` and `bin/` = bundled resources and executables

Explore each folder's AGENTS.md file before writing in any of the folder.

If you need to write code that seems to break any of this architecture, stop and discuss with me a new architecture recommendation before implementing any code.

Testing:
- Put backend unit/local tests near the code they verify, typically in folder-level `__tests__`.
- Put Electron/backend integration tests in `electron/test/integration`.
- Put full app end-to-end tests in root `test/e2e`.
- Consult each subfolder `AGENTS.md` for domain-specific test expectations and quirks.
