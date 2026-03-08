# Contributing Architecture Guide

Use this file as the starting point for understanding the project structure.

## Primary Architecture Docs

- Frontend / renderer:
  - [src/ARCHITECTURE.md](/Users/danielmikaleola/Documents/Development/TeknegramElectron/src/ARCHITECTURE.md)

- Electron backend / main process:
  - [electron/ARCHITECTURE.md](/Users/danielmikaleola/Documents/Development/TeknegramElectron/electron/ARCHITECTURE.md)

## Feature Templates

- Frontend feature template:
  - [src/FEATURE_TEMPLATE.md](/Users/danielmikaleola/Documents/Development/TeknegramElectron/src/FEATURE_TEMPLATE.md)

- Electron backend feature template:
  - [electron/FEATURE_TEMPLATE.md](/Users/danielmikaleola/Documents/Development/TeknegramElectron/electron/FEATURE_TEMPLATE.md)

## How To Decide Where Code Belongs

### If the code is renderer/UI code
Look in:

- `src/layout/*`
- `src/features/*`
- `src/app/*`
- `src/styles/*`

Use `src/ARCHITECTURE.md` and `src/FEATURE_TEMPLATE.md`.

### If the code is Electron main-process/backend code
Look in:

- `electron/ipc/*`
- `electron/services/*`
- `electron/db/*`
- `electron/runtime/*`
- `electron/core/*`

Use `electron/ARCHITECTURE.md` and `electron/FEATURE_TEMPLATE.md`.

### If the code talks to native C++
Look in:

- `electron/services/nativeProcessFactory.ts`
- `electron/bin/executables/*`
- `native/corpus_builder/*`

Path policy for native executables and generated output is handled through:

- `electron/runtime/runtimePaths.ts`

## Key Project Rules

- Renderer components should not call `window.api` directly.
- IPC handlers should be registered only in `electron/ipc/registerHandlers.ts`.
- Shared IPC request/response shapes live in `electron/ipc/contracts/*`.
- IPC validation schemas live in `electron/ipc/validationSchemas/*`.
- Services orchestrate; repositories do SQL only.
- Runtime path logic belongs in `electron/runtime/*`.
- Backend logging goes through `electron/services/logger.ts`.

## Recommended Reading Order For New Contributors

1. Read this file.
2. Read `src/ARCHITECTURE.md` if working on UI/React.
3. Read `electron/ARCHITECTURE.md` if working on Electron/backend.
4. Use the relevant `FEATURE_TEMPLATE.md` before adding a new feature.
