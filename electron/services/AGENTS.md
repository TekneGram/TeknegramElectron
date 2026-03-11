Used for backend use-case orchestration

Purpose
  - Services coordinate backend work for a feature or domain.
  - They sit below IPC and above persistence, runtime helpers, native-process helpers, and infrastructure
  adapters.
  - Services should return typed response data and throw structured backend errors for known failure cases.

Organization
  - Group service files by domain in subfolders when they belong to the same backend concern.
  - Examples:
    - `services/projects/*`
    - `services/system/*`
  - Prefer one domain folder per backend capability area.
  - Add to an existing domain folder when the new operation belongs to the same business area and shares the same supporting helpers.
  - Create a domain folder when multiple operations share the same business area, data model, or supporting
  helpers.
  - Keep cross-domain helpers at the top level of `services/*` only when they are genuinely reusable across
  domains.

Service responsibilities
  - Accept typed request data.
  - Accept `RequestContext` when request-scoped logging or event emission is needed.
  - Validate runtime and business constraints beyond IPC shape validation.
  - Call repositories, runtime helpers, infrastructure ports/adapters, and native-process helpers.
  - Define transaction boundaries.
  - Log important backend events.
  - Map raw repository row-shaped data into typed IPC response DTOs when needed.
  - Return typed response DTOs.

Service boundaries
  - Do not register IPC handlers here.
  - Do not contain raw SQL unless there is a strong reason.
  - Do not hardcode runtime paths.
  - Do not let platform-specific Electron API usage spread here if it belongs in `infrastructure/*`.

Native process helpers
  - `nativeProcessFactory.ts` is the main helper for creating and running native processes from services.
  - Use it when a service needs to invoke a bundled native executable and optionally consume JSON progress/result
  output.
  - Services should keep feature-specific orchestration in the service and keep process transport behavior in the
  native-process helper.
  - Do not duplicate process spawning/parsing logic inside feature services.

Registries
  - Create a registry when a long-running operation must be looked up later by request ID or similar key.
  - Example use case:
    - store an active native process so a cancel service can find and stop it
  - A registry should be small, focused, and operation-oriented.
  - Keep it in `services/*` only if it is service-level orchestration state, not generic infrastructure.
  - Do not use a registry unless there is a real lifecycle need such as cancellation, cleanup, or status lookup.

Logging
  - `logger.ts` provides backend logging for the Electron main process.
  - Use it from services to record important lifecycle events, failures, warnings, and progress.
  - Include correlation IDs from `RequestContext` when available.
  - Prefer structured metadata in logs instead of ad hoc string concatenation.

Typical pattern
  - IPC validates request
  - service orchestrates the use case
  - service calls runtime/db/infrastructure/native helpers
  - service logs meaningful events
  - service returns typed response or throws a structured backend error

Testing
  - Write service unit tests here for orchestration logic, branching, transactions, cancellation, and DTO mapping.
  - Mock repositories, runtime helpers, infrastructure ports/adapters, and native-process helpers in service unit tests.
  - Write registry tests here when a registry is used for lifecycle control such as cancellation or status lookup.
