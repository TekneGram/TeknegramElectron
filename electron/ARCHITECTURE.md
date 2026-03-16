# Electron Backend Architecture

## Purpose
The `electron/` folder contains the main-process backend for the app. It owns:

- IPC request handling
- backend error normalization
- database initialization, migrations, and repositories
- runtime path resolution
- native executable orchestration
- reusable LLM orchestration and provider pipelines
- backend logging
- Electron-side infrastructure boundaries for platform APIs

## Folder Responsibilities

### `electron/ipc/*`
IPC transport boundary.

- `registerHandlers.ts` is the top-level composition entrypoint
- `registerHandlers/*` groups channel registration by concern/domain
- `safeHandle.ts` wraps handlers in request-scoped error normalization
- `validate.ts` and `validationSchemas/*` validate raw payloads at the IPC boundary
- `contracts/*` defines IPC request/response and event DTOs

### `electron/services/*`
Backend use-case orchestration.

Services should:

- accept typed request data
- accept `RequestContext` when request-scoped logging/events are needed
- validate runtime and business constraints
- call repositories, runtime helpers, native runners, LLM controllers, and infrastructure adapters
- define transaction boundaries
- return typed response data

Services should not:

- register IPC handlers
- contain raw SQL unless there is a strong reason
- hardcode runtime paths

### `electron/llm/*`
Reusable LLM subsystem.

- `controllers/*` provides LLM orchestration entrypoints used by backend services
- `operations/*` implements use-case-specific LLM workflows below controllers
- `policies/*` centralizes provider/model defaults, limits, fallback rules, and other decision logic
- `providers/*` isolates provider-specific HTTP clients and provider registries
- `schemas/*` validates structured LLM outputs
- `shared/*` defines LLM subsystem DTOs and shared types
- `tools/*` contains tool/function-calling loop types and implementations

Use this layer when backend features need:

- external LLM summarization or interpretation
- provider-agnostic model selection and request shaping
- structured response validation
- reusable tool/function-calling loops
- a subsystem that can be shared by many services

Rules:

- keep `llm/*` independent from IPC and renderer concerns
- do not register IPC handlers here
- do not access Electron UI/system APIs directly here
- retrieve credentials through injected interfaces rather than direct storage calls in controllers/operations
- keep provider-specific transport details in `providers/*`
- prefer structured JSON responses validated by `schemas/*`

### `electron/infrastructure/*`
Electron-side platform boundary.

- `ports/*` defines interfaces for Electron/platform capabilities used by services
- `adapters/*` implements those interfaces using Electron APIs

Use this layer when a service needs Electron-specific UI/system capabilities such as:

- file/folder pickers
- window-aware dialogs
- future shell, clipboard, or native notification integrations

This is intentionally narrower than the frontend ports/adapters pattern. It exists to keep direct Electron API calls from spreading through services.

### `electron/db/*`
Persistence layer.

- `initializeDatabase.ts` performs startup-time DB initialization
- `runMigrations.ts` applies ordered SQL migrations
- `appDatabase.ts` opens/closes the runtime DB for normal service use
- `sqlite.ts` contains generic DB helpers only
- `repositories/*` contains table-oriented SQL operations

### `electron/runtime/*`
Filesystem and runtime path policy.

- `bootstrapStorage.ts` creates writable runtime folders and copies the seed DB on first run
- `runtimePaths.ts` resolves dev vs packaged paths for DBs, assets, executables, generated data, and models

### `electron/core/*`
Shared backend error and request context types.

### `electron/bin/*` and `electron/assets/*`
Bundled executables and read-only resources.

- `assets/*` contains packaged resources such as models and seed data
- `bin/executables/*` contains platform-specific native binaries
- generated writable runtime outputs do not belong in `assets/*`

## Request Flow
Typical flow from renderer to backend:

1. Frontend port defines the operation shape.
2. Frontend adapter calls `window.api.invoke(...)`.
3. `electron/ipc/registerHandlers.ts` dispatches to domain registration modules in `electron/ipc/registerHandlers/*`.
4. IPC layer validates payload shape with Zod.
5. A service in `electron/services/*` executes the use case.
6. The service calls repositories, runtime helpers, native executables, LLM controllers, and infrastructure adapters as needed.
7. `safeHandle` wraps the result into `Result<T>`.
8. Frontend adapter maps backend result/error into frontend `AppResult<T>`.

When an LLM-backed feature is involved, the service typically delegates to the LLM subsystem like this:

1. service gathers validated domain data
2. service calls an LLM controller in `electron/llm/controllers/*`
3. controller resolves provider/model policy and credentials
4. operation prepares the provider request
5. provider client calls the external LLM
6. schema validation normalizes the structured response
7. controller returns a typed result or normalized LLM failure
8. service decides how that result fits the wider use case

## IPC
Files:

- `electron/ipc/registerHandlers.ts`
- `electron/ipc/registerHandlers/*`
- `electron/ipc/safeHandle.ts`
- `electron/ipc/validate.ts`
- `electron/ipc/contracts/*`
- `electron/ipc/validationSchemas/*`

Rules:

- Keep `registerHandlers.ts` as a thin composition file.
- Register handlers by concern/domain in `registerHandlers/*`.
- Use `safeHandle` for request-scoped handlers.
- Keep handler registrations thin.
- Validate raw args at the IPC boundary with `validateOrThrow(...)`.
- Use channel naming like `domain:action`, for example `projects:list`.

Pattern:

```ts
safeHandle<Request, Response>("domain:action", async (_event, rawArgs, ctx) => {
  const args = validateOrThrow(schema, rawArgs);
  return service(args, ctx);
});
```

## Contracts
Files:

- `electron/ipc/contracts/*`

Purpose:

- define shared request/response DTOs
- act as the single source of truth for IPC payload shapes
- be imported by schemas, handler registration modules, preload, and services when needed

## Validation
Files:

- `electron/ipc/validationSchemas/*`
- `electron/ipc/validate.ts`

Distinction:

- IPC validation checks payload shape and types
- service validation checks runtime and business constraints

Examples of service validation:

- folder path exists
- folder path is a directory
- semantic rules path is a file

## Errors
Files:

- `electron/core/appError.ts`
- `electron/core/appException.ts`
- `electron/core/requestContext.ts`

Rules:

- Use `raiseAppError(...)` or `throw new AppException(...)` for known backend failures.
- Let `safeHandle` normalize thrown errors into `Result<T>`.
- Use `RequestContext` for correlation IDs in logs and request-scoped progress/event emission.

Common error categories:

- validation
- filesystem
- database
- native process
- IPC

## Database
Files:

- `electron/db/initializeDatabase.ts`
- `electron/db/migration/*`
- `electron/db/runMigrations.ts`
- `electron/db/sqlite.ts`
- `electron/db/appDatabase.ts`
- `electron/db/repositories/*`

### Startup Initialization
Database setup happens at app startup:

1. `bootstrapStorage()` ensures writable folders exist and copies the seed DB if needed.
2. `initializeDatabase()` opens the runtime DB.
3. `runMigrationsFromFiles()` applies ordered migrations.
4. The DB handle is closed before normal request handling begins.

Services should not run migrations on every request.

### SQLite Helpers
`electron/db/sqlite.ts` should contain generic DB helpers only, such as:

- open/close database
- run raw SQL
- run prepared statements
- query rows
- run transactions

### Repositories
Repositories should stay dumb and table-oriented.

Purpose:

- perform SQL only
- accept a DB handle
- return raw row shapes
- execute inserts/selects/updates

Repositories should not:

- generate UUIDs
- compute paths
- orchestrate multiple operations
- decide transaction boundaries

Transaction boundaries belong in services.

## Runtime Paths
Files:

- `electron/runtime/runtimePaths.ts`
- `electron/runtime/bootstrapStorage.ts`

Purpose:

- centralize all path policy
- distinguish dev paths from packaged paths
- distinguish writable runtime data from bundled read-only assets

Examples:

- runtime database path
- generated corpora output path
- seed DB path
- native executable path
- model file path

Rules:

- generated writable data goes under `userData` in production
- packaged resources are read-only
- services should ask runtime helpers for paths, not hardcode them
- if secret material is stored in encrypted files, `runtimePaths.ts` should define those writable locations

## Native Executables
Files:

- `electron/services/nativeProcessFactory.ts`
- `electron/services/nativeProcessRunner.ts`
- `electron/bin/executables/<platform>/*`
- `native/corpus_builder/*`

Purpose:

- resolve platform-specific executable paths
- spawn native binaries
- send JSON input over stdin when needed
- parse newline-delimited JSON stdout
- surface progress updates
- return final result data

Development executable location:

- `electron/bin/executables/<platform>/`

Production path resolution is handled through `runtimePaths.ts`.

## LLM Subsystem
Files:

- `electron/llm/controllers/*`
- `electron/llm/operations/*`
- `electron/llm/policies/*`
- `electron/llm/providers/*`
- `electron/llm/schemas/*`
- `electron/llm/shared/*`
- `electron/llm/tools/*`

Purpose:

- provide a reusable backend subsystem for LLM-backed capabilities
- keep provider-specific request/response details out of feature services
- support policy-driven provider/model selection
- validate structured LLM responses before they flow back into services
- prepare for future tool/function-calling workflows without mixing that logic into unrelated services

Typical dependency direction:

- `services/*` -> `llm/controllers/*`
- `llm/controllers/*` -> `llm/operations/*`, `llm/policies/*`, injected credential provider, injected provider registry
- `llm/operations/*` -> `llm/policies/*`, `llm/providers/*`, `llm/schemas/*`, `llm/shared/*`
- `llm/providers/*` -> external LLM APIs

Secrets:

- LLM controllers should depend on injected credential providers rather than direct storage access
- concrete secret storage should live outside `llm/*`, typically in `electron/infrastructure/*` when it depends on
  Electron or OS facilities
- LLM code must never log or return raw API keys

Progress:

- LLM controllers and operations should expose progress through typed callbacks or another injected abstraction
- services may bridge those progress callbacks into `RequestContext.sendEvent(...)` when request-scoped renderer
  updates are needed

Example:

1. a service gathers native-process output or corpus metadata
2. it calls an LLM controller such as `summarizeCorpusMetadataController(...)`
3. policy resolves provider and model defaults
4. credentials are retrieved through an injected `CredentialProvider`
5. the operation builds a structured provider request
6. a provider client such as an OpenAI adapter performs the HTTP call
7. response JSON is validated with a Zod schema
8. the typed result returns to the calling service

## Native JSON Contract
Electron-native communication uses:

- JSON request on stdin
- newline-delimited JSON messages on stdout
- stderr for diagnostics

Typical stdout messages:

```json
{"type":"progress","percent":15,"message":"Starting corpus build"}
{"type":"result","data":{"outputDir":"/path/to/output"}}
```

Native side may also support CLI mode for terminal use, but Electron integration should prefer JSON mode.

## Recommended Pattern For New Features
When adding a new backend feature:

1. Add request/response types in `electron/ipc/contracts/*`.
2. Add Zod schema in `electron/ipc/validationSchemas/*`.
3. Add repository functions if DB work is needed.
4. Add or extend infrastructure ports/adapters in `electron/infrastructure/*` if the feature needs Electron/platform APIs.
5. Add a service in `electron/services/<feature>/*`.
6. If the feature uses a reusable LLM workflow, call an LLM controller from `electron/llm/*` instead of embedding provider logic directly in the service.
7. Register the IPC handler in a relevant file under `electron/ipc/registerHandlers/*`.
8. Ensure `electron/ipc/registerHandlers.ts` composes the new registration module.
9. Add frontend port + adapter.

## Example: `projects:create`
The `projects:create` flow should look like this:

1. IPC registration validates `CreateProjectRequest`.
2. `createProject` service validates runtime constraints.
3. Service computes the corpus output path.
4. Service calls the native corpus builder with JSON input.
5. Service logs progress from the native runner.
6. On success, service inserts project/corpus/path rows in one DB transaction.
7. Service returns `CreateProjectResponse`.

## Core Rules
- Keep `registerHandlers.ts` thin.
- Split handler registration by domain/concern in `registerHandlers/*`.
- Use `safeHandle` for request-scoped IPC.
- Use contracts as the shared source of truth.
- Keep repositories SQL-focused and dumb.
- Put orchestration in services.
- Use infrastructure adapters when services need direct Electron/platform APIs.
- Use runtime path helpers for all filesystem locations.
- Use structured app errors instead of plain `Error` when the failure category is known.
- Keep native process transport generic; keep feature logic in services.
