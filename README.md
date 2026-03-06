# Electron React Native Starter

Reusable starter for Electron + React + native process integration with:
- request-scoped IPC error handling
- thin bridge + frontend ports/adapters
- runtime path separation for dev vs packaged builds
- SQLite bootstrap/migrations
- packaging-ready structure with `electron-builder`

## Quick Start
1. `npm install`
2. Copy `.env.example` to `.env` and fill values as needed.
3. Run `npm run dev`
4. Run `npm run build`

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
