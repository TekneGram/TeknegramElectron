Use `electron/runtime/*` for runtime environment and filesystem policy.

  Purpose

  - Centralize path resolution and startup storage setup for the Electron backend.
  - Keep dev vs packaged path logic in one place.
  - Keep writable vs bundled read-only path decisions in one place.

  Files

  - `runtimePaths.ts`
    - resolves runtime paths for databases, generated data, executables, models, and bundled assets
  - `bootstrapStorage.ts`
    - prepares writable runtime folders and copies first-run resources such as the seed DB

  Rules

  - Services should ask runtime helpers for paths instead of hardcoding filesystem locations.
  - Do not put feature orchestration here.
  - Do not put SQL or IPC logic here.
  - Do not call Electron platform UI APIs here.
  - Treat this folder as the source of truth for path policy.

  Use this layer when

  - a service needs a filesystem path
  - startup needs to ensure writable folders exist
  - the app must distinguish dev paths from packaged paths
  - the app must distinguish generated writable data from bundled read-only resources

  Do not use this layer for

  - request handling
  - business validation
  - database queries
  - Electron UI/system capability wrappers

  Testing

  - Write tests here for path resolution and storage bootstrap behavior.
  - Mock filesystem and environment/app packaging state when needed.
