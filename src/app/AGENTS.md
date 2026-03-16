When writing code here the main rule is: put transport and platform concerns in src/app, keep them thin and typed, and make features consume them through ports and AppResult rather than raw IPC:

  - Treat src/app as the frontend infrastructure boundary.
    Feature code should depend on ports and adapters from here, not on window.api or raw IPC.
  - Define request/response contracts in src/app/ports/*.
    Ports describe what the renderer needs from the outside world.
    They should return Promise<AppResult<T>>, not thrown exceptions.
  - Keep adapters in src/app/adapters/* as the only concrete bridge to Electron/browser APIs.
    Adapters implement ports.
  - All IPC request adapters should go through invokeRequest.ts.
    Do not duplicate window.api.invoke(...) logic in each adapter.
  - invokeRequest(...) is responsible for translating backend DTO results into frontend AppResult<T>.
    Backend errors are mapped centrally to frontend AppError.kind.
  - Keep backend error-code mapping centralized.
    New backend error codes should be added to mapBackendError(...), not interpreted ad hoc in features.
  - Use AppResult<T> for infrastructure boundaries and thrown FrontAppError for feature/service layers.
    Boundary returns results; services unwrap and throw.
  - Adapters should stay thin.
    They should mostly:
      - choose the IPC channel
      - pass the payload
      - map event payloads into typed frontend event objects
  - Event adapters are separate from request adapters.
    Use dedicated event ports/adapters for subscriptions like project progress.
  - Notification handling is abstracted behind a notifier port.
    Feature code should call toastifyNotifier through the adapter/port pattern, not import react-toastify
    directly.
  - Shared error shape lives in src/app/types/result.ts.
    The rest of the frontend should rely on kind, userMessage, and optional debugId, not backend-specific codes.
  - FrontAppError is the frontend exception type for unwrapped failures.
    If a service converts AppResult into thrown errors, it should throw FrontAppError when it needs typed error
    handling upstream.
  - Ports should model domain operations, not transport details.
    For example:
      - createProject
      - cancelCreateProject
      - pickCorpusFolder
        not generic IPC calls.
  - Keep providers in src/app/providers/* for genuinely cross-cutting app state only.
    They are not part of request flow.

Testing:
  - Write unit tests here for adapter result mapping, error mapping, and other infrastructure-bound transformations.
  - Test providers here only when provider logic is non-trivial.
  - Mock `window.api` in tests; do not hit real IPC from this layer's unit tests.
  - Test `AppResult` mapping and `FrontAppError`-related behavior precisely.
