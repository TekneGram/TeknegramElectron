# Backend Feature Template

Use this pattern when adding a new Electron backend feature.

## Suggested Files

```text
electron/ipc/contracts/<feature>.contracts.ts
electron/ipc/validationSchemas/<feature>.schemas.ts
electron/services/<feature>/<action>.ts
electron/db/repositories/<feature>Repositories.ts
```

Only create the files you actually need.

## Responsibilities

### IPC Contracts
File:

- `electron/ipc/contracts/<feature>.contracts.ts`

Purpose:

- define request/response DTOs
- act as shared source of truth for IPC payload shapes

Use these types in:

- validation schemas
- `registerHandlers.ts`
- service files

### Validation Schemas
File:

- `electron/ipc/validationSchemas/<feature>.schemas.ts`

Purpose:

- validate payload shape and types at the IPC boundary
- keep Zod focused on transport validation

Do not put filesystem or business-rule validation here.

### Service
File:

- `electron/services/<feature>/<action>.ts`

Purpose:

- implement the use case
- accept typed request + `RequestContext`
- orchestrate repositories, runtime paths, logging, and native executables
- return typed response

Services should:

- validate runtime assumptions
- generate UUIDs / timestamps
- compute runtime output paths
- run DB transactions
- log progress / failures
- throw `AppException` on failure

### Repository
File:

- `electron/db/repositories/<feature>Repositories.ts`

Purpose:

- perform SQL only
- accept a DB handle
- return raw rows or execute inserts/updates

Repositories should not:

- generate UUIDs
- decide transactions
- compute paths
- orchestrate multiple steps

## Typical Handler Pattern

Register in:

- `electron/ipc/registerHandlers.ts`

Pattern:

```ts
safeHandle<Request, Response>("domain:action", async (_event, rawArgs, ctx) => {
  const args = validateOrThrow(schema, rawArgs);
  return service(args, ctx);
});
```

Rules:

- keep handlers thin
- register all handlers in one place
- validate at boundary
- call service only after validation

## Typical Service Pattern

1. log start with `correlationId`
2. validate runtime constraints
3. compute IDs / timestamps / paths
4. call native runner or repositories
5. use `runInTransaction(...)` if multiple DB writes belong together
6. log completion
7. return typed response

## Typical Repository Pattern

Example shape:

```ts
export function insertSomething(db: SqliteDatabase, row: NewSomethingRow): void {
  executeRun(
    db,
    `
      INSERT INTO something (uuid, created_at)
      VALUES (?, ?)
    `,
    [row.uuid, row.created_at]
  );
}
```

Keep repository helpers dumb and predictable.

## Validation Split

### IPC validation
Checks:

- field presence
- field type
- payload shape

### Service validation
Checks:

- path exists
- path is directory/file
- names are non-empty after trim
- current operation is valid for the environment

Both are needed.

## Error Handling Rules

Use:

- `raiseAppError(...)`
- or `throw new AppException(...)`

Prefer structured app errors over plain `Error` when the failure category is known.

Examples:

- `VALIDATION_MISSING_FIELD`
- `FS_NOT_FOUND`
- `DB_QUERY_FAILED`
- `CPP_PROCESS_NON_ZERO_EXIT`

## Database Rules

Files:

- `electron/db/sqlite.ts`
- `electron/db/appDatabase.ts`

Patterns:

- use `createAppDatabase(getRuntimeDbPath())`
- use repositories for SQL
- use `runInTransaction(...)` in services when multiple DB writes must succeed together

## Runtime Paths

Use:

- `electron/runtime/runtimePaths.ts`

Never hardcode:

- executable paths
- generated output directories
- DB paths
- packaged writable locations

Services should ask runtime helpers for paths.

## Native Executables

Use:

- `electron/services/nativeProcessFactory.ts`

Pattern:

1. build JSON request
2. create runner with executable name
3. set `expectJsonLines: true` if native stdout is structured JSON
4. log progress through `onProgress`
5. await final result

Native contract should prefer:

- stdin JSON request
- newline-delimited JSON stdout messages

## Example End-To-End Feature

For `projects:create`:

1. define `CreateProjectRequest` / `CreateProjectResponse`
2. add `createProjectSchema`
3. implement `createProject(...)` service
4. insert project/corpus/path rows through repositories
5. register `"projects:create"` in `registerHandlers.ts`

## Core Rules

- Contracts live in `electron/ipc/contracts/*`
- IPC validation lives in `electron/ipc/validationSchemas/*`
- Handlers stay thin
- Services orchestrate
- Repositories do SQL only
- Runtime paths come from `electron/runtime/*`
- Logs go through `electron/services/logger.ts`
- Native executable transport goes through `nativeProcessFactory.ts`
