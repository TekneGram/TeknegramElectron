Use `electron/core/*` for shared backend-core primitives.

Purpose
  - define backend error types and helpers
  - define request-scoped context types
  - provide small shared building blocks used across the Electron backend

Typical contents
  - app error/result types
  - exception helpers
  - request context and correlation metadata

Rules
  - Keep this folder small, generic, and reusable across backend domains.
  - Do not put feature-specific orchestration here.
  - Do not put IPC registration here.
  - Do not put SQL or repository logic here.
  - Do not put Electron platform API code here.
  - Prefer framework-light code in this folder.

Goal
  - give services, IPC, and infrastructure a common backend language for errors and request context

Testing
  - Write small unit tests here for error types, exception helpers, and request-context-related primitives.
  - Keep tests framework-light and focused on pure behavior.
