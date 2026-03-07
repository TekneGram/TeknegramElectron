# Electron Backend Architecture

## Purpose
The `electron/` folder contains the main-process backend for the app. It owns:

- IPC request handling
- backend error normalization
- database migrations and repositories
- runtime path resolution
- native executable orchestration
- backend logging

## Request Flow
Typical flow from renderer to backend:

1. Frontend port defines the operation shape.
2. Frontend adapter calls `window.api.invoke(...)`.
3. `electron/ipc/registerHandlers.ts` receives the request.
4. IPC layer validates payload shape with Zod.
5. A service in `electron/services/*` executes the use case.
6. Service calls repositories, filesystem helpers, and native executables as needed.
7. `safeHandle` wraps the result into `Result<T>`.
8. Frontend adapter maps backend result/error into frontend `AppResult<T>`.

## IPC
Files:

- `electron/ipc/registerHandlers.ts`
- `electron/ipc/safeHandle.ts`
- `electron/ipc/validate.ts`
- `electron/ipc/contracts/*`
- `electron/ipc/validationSchemas/*`

Rules:

- Register all IPC handlers in `registerHandlers.ts`.
- Use `safeHandle` for request-scoped handlers.
- Keep handlers thin.
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
- act as single source of truth for IPC payload shapes
- be imported by schemas, handlers, and services

Example:

- `CreateProjectRequest`
- `CreateProjectResponse`

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
- Use `RequestContext` for correlation IDs in logs and services.

Common error categories:

- validation
- filesystem
- database
- native process
- IPC

## Services
Files:

- `electron/services/*`
- feature services under `electron/services/<feature>/*`

Purpose:

- own use-case orchestration
- combine repositories, runtime paths, logging, and native runner
- accept typed request + `RequestContext`
- return typed response

Services should do things like:

- validate runtime assumptions
- generate UUIDs and timestamps
- compute runtime output paths
- call native executables
- run DB transactions
- log progress and failure

Services should not:

- register IPC
- perform raw renderer work
- contain SQL strings unless there is a very strong reason

## Logging
Files:

- `electron/services/logger.ts`

Purpose:

- log info/warn/error lines from the backend
- append logs to the main-process log file

Log file location:

- `app.getPath("userData")/logs/main.log`

## Database
Files:

- `electron/db/migration/*`
- `electron/db/sqlite.ts`
- `electron/db/appDatabase.ts`
- `electron/db/repositories/*`

### Migrations
Use ordered SQL files in `electron/db/migration/*`.

Purpose:

- define schema changes
- initialize tables on app startup

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

Rule:

- generated writable data goes under `userData` in production
- packaged resources are read-only
- services should ask runtime helpers for paths, not hardcode them

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

Example:

- `electron/bin/executables/mac/corpus_build_pipeline`

Production path resolution is handled through `runtimePaths.ts`.

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
4. Add a service in `electron/services/<feature>/*`.
5. Register the IPC handler in `electron/ipc/registerHandlers.ts`.
6. Add frontend port + adapter.

## Example: `projects:create`
The `projects:create` flow should look like this:

1. IPC handler validates `CreateProjectRequest`.
2. `createProject` service validates runtime constraints.
3. Service computes the corpus output path.
4. Service calls the native corpus builder with JSON input.
5. Service logs progress from the native runner.
6. On success, service inserts project/corpus/path rows in one DB transaction.
7. Service returns `CreateProjectResponse`.

## Core Rules
- Keep `registerHandlers.ts` thin.
- Use `safeHandle` for request-scoped IPC.
- Use contracts as the shared source of truth.
- Keep repositories SQL-focused and dumb.
- Put orchestration in services.
- Use runtime path helpers for all filesystem locations.
- Use structured app errors instead of plain `Error` when the failure category is known.
- Keep native process transport generic; keep feature logic in services.
