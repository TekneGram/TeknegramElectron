# Template Setup Checklist

Use this checklist immediately after cloning this starter.

## 1) Identity and Packaging
- Update `package.json`:
  - `name`
  - `description`
  - `author`
- Update `electron-builder.json5`:
  - `appId`
  - `productName`
  - platform targets and artifact names

## 2) Signing and Notarization
- Add required environment variables in CI/local shell for your platform:
  - macOS signing/notarization credentials
  - Windows signing credentials (if used)
- Confirm platform packaging scripts (`package:mac`, `package:win`, `package:linux`).

## 3) Runtime Assets
- Decide whether to ship:
  - seed DB (`electron/assets/seed/app.sqlite`)
  - models/config files (`electron/assets/...`)
  - native executables (`electron/bin/executables/<platform>/...`)
- Verify all required `extraResources` paths exist.

## 4) Database Strategy
- Add migration files under `electron/db/migration/*.sql`.
- Keep migration file naming ordered (`001_*.sql`, `002_*.sql`, ...).
- Ensure first-run bootstrap behavior matches your seed/migration strategy.

## 5) IPC Contract Conventions
- Register channels only in `electron/ipc/registerHandlers.ts`.
- Use `safeHandle` for every request-scoped handler.
- Validate each incoming request with feature-specific schema + `validateOrThrow`.
- Keep channel naming consistent (`domain:action`, e.g. `system:ping`).

## 6) Frontend Boundary Rules
- Keep `window.api` usage inside `src/app/adapters/*` only.
- Define frontend-facing types in `src/app/types/*` and ports in `src/app/ports/*`.
- Map backend DTOs to frontend app models inside adapters.

## 7) Native Process Integration
- Use `electron/services/nativeProcessRunner.ts` as process transport boundary.
- Parse/validate native stdout payloads in feature services, not in runner infrastructure.

## 8) Quality Gates
- Ensure local checks pass:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `npm run test`
- Enable CI checks in `.github/workflows/ci.yml`.
