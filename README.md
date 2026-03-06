# Teknegram
A corpus linguistics tool

## Quick Start
1. Clone the repo with submodules:
   `git clone --recurse-submodules <parent-repo-url>`
2. If you already cloned without submodules, initialize them:
   `git submodule update --init --recursive`
3. `npm install`
4. Copy `.env.example` to `.env` and fill values as needed.
5. Run `npm run dev`
6. Run `npm run build`

## Submodule Workflow

This repo tracks the native C++ project in `native/corpus_builder` as a Git submodule. That means there are two repositories involved when you change native code:
- the parent Electron app repo
- the `native/corpus_builder` repo

### Clone
- Recommended:
  `git clone --recurse-submodules https://github.com:TekneGram/TeknegramElectron.git
- If the repo is already cloned:
  `git submodule update --init --recursive`

### Pull Latest Changes
- Update the parent repo:
  `git pull`
- Update submodules to the commits referenced by the parent repo:
  `git submodule update --init --recursive`

### Commit And Push Native C++ Changes
1. Commit and push inside the submodule first:
   `git -C native/corpus_builder status`
   `git -C native/corpus_builder add .`
   `git -C native/corpus_builder commit -m "Describe native change"`
   `git -C native/corpus_builder push`
2. Commit the updated submodule pointer in the parent repo:
   `git add native/corpus_builder`
   `git commit -m "Update corpus_builder submodule"`
   `git push`

### Commit And Push Parent-Repo-Only Changes
If you only changed Electron/React code and did not change files inside `native/corpus_builder`, use the normal parent repo workflow:
`git add .`
`git commit -m "Describe app change"`
`git push`

### Important Note
If you push the parent repo without first pushing the new `native/corpus_builder` commit, other clones may fail to fetch the referenced submodule commit.

## Architecture Summary

### Electron (`electron/`)
- `main.ts`: app lifecycle and startup wiring.
- `ipc/registerHandlers.ts`: single place to register IPC channels.
- `ipc/safeHandle.ts`: wraps handlers with correlation ID, logging, and standard error envelope.
- `ipc/validate.ts`: request validation utility for feature schemas.
- `runtime/runtimePaths.ts`: centralized path policy.
- `runtime/bootstrapStorage.ts`: first-run writable storage setup.
- `db/*`: app DB setup and migrations.
- `services/nativeProcessRunner.ts`: native process execution boundary (transport only).

### Frontend (`src/`)
- Feature-first organization under `src/features/*`.
- `src/app/ports/*`: frontend-side contracts.
- `src/app/adapters/*`: adapters for IPC bridge and notifications.
- React Query for request state, Context/Reducer for local UI state.

## Runtime Path Rules
- Read-only packaged assets: `process.resourcesPath`
- Writable runtime data: `app.getPath("userData")`
- Never write generated runtime data inside packaged app resources.

## Error Handling Model
- Backend returns `Result<T>` envelope from `safeHandle`.
- Backend errors include stable codes and optional correlation IDs.
- Frontend maps backend error DTOs to frontend app errors in IPC adapter.
- Notification display is handled via `NotifierPort` (`react-toastify` adapter).

## Packaging Notes
- Configure shared assets and platform-specific executables in `electron-builder.json5`.
- Keep binaries/models/seed DB in `extraResources`.
- Keep generated runtime output out of source control.

## Starter Conventions
- Keep error code list append-only.
- Add one validation schema per new request channel.
- Keep `window.api` usage only in frontend adapters.
- Keep `main.ts` thin; register all channels in `registerHandlers.ts`.

See [`TEMPLATE_SETUP.md`](./TEMPLATE_SETUP.md) for the post-clone checklist.
