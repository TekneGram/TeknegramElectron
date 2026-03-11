Use `electron/infrastructure/*` for Electron/platform capability boundaries used by backend services.

Purpose
  - `ports/*` defines small interfaces for platform capabilities.
  - `adapters/*` implements those interfaces using Electron APIs or other platform libraries.

Use this layer when
  - a service needs direct Electron/platform capabilities such as:
    - dialogs
    - BrowserWindow-aware behavior
    - shell/openExternal
    - clipboard
    - native notifications

Rules
  - Services should depend on infrastructure ports when the capability belongs to this boundary.
  - Adapters are the place where direct Electron/platform API calls should live.
  - This layer is optional; do not add a port/adapter unless the platform capability is reusable, likely to grow, or would otherwise spread across services.
  - Keep ports small and capability-focused.
  - Keep adapters thin and implementation-focused.
  - Do not put business logic here.
  - Do not register IPC handlers here.
  - Do not put DB logic here.
  - Do not put runtime path policy here.

Goal
  - Keep Electron/platform API usage from spreading across services while avoiding unnecessary architecture
  elsewhere.

Testing
  - Write adapter tests here when Electron/platform wrapper behavior is non-trivial.
  - Mock Electron APIs directly in this layer's tests.
  - Do not retest service orchestration here.
