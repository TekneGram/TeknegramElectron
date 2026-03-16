Use `electron/llm/*` for the backend LLM subsystem.

Purpose
  - Own reusable LLM-specific request/response pipelines that may be used by many backend services.
  - Keep provider selection, request shaping, response normalization, tool-loop logic, and LLM policy out of
  unrelated feature services.
  - Stay independent from IPC and renderer concerns so services can call LLM controllers as a backend subsystem.

Folder roles
  - `controllers/*`
    - orchestration entrypoints for LLM use cases
    - coordinate policy resolution, credential lookup, provider routing, and boundary normalization
  - `operations/*`
    - use-case-specific LLM workflows below the controller layer
    - build provider requests, invoke provider clients, and parse validated results
  - `policies/*`
    - own model selection, provider defaults, token/shape limits, fallback rules, and other LLM decision logic
  - `providers/*`
    - own provider-specific HTTP clients and provider registries
    - isolate OpenAI/Anthropic/Gemini protocol details from the rest of the subsystem
  - `schemas/*`
    - own Zod schemas for structured LLM outputs and related validation helpers
  - `shared/*`
    - own DTOs and shared LLM subsystem types
    - keep provider DTOs separate from use-case DTOs when that improves clarity
  - `tools/*`
    - own tool/function-calling loop types and implementations

Rules
  - Keep `llm/*` independent from IPC transport.
  - Do not register IPC handlers here.
  - Do not put renderer-specific types or `window.api` usage here.
  - Do not access Electron UI/platform APIs directly from controllers or operations.
  - Retrieve API keys and secrets through injected interfaces, not direct storage calls inside LLM operations.
  - Keep provider-specific HTTP request details inside `providers/*`.
  - Keep prompt/request shaping and response normalization explicit and typed.
  - Prefer structured JSON responses validated by `schemas/*` over ad hoc plain-text parsing.
  - Keep policy decisions centralized in `policies/*` rather than scattering model/provider logic through
  controllers and operations.
  - Feature services may call LLM controllers, but should not reimplement provider orchestration themselves.

Dependency direction
  - `services/*` -> `llm/controllers/*`
  - `llm/controllers/*` -> `llm/operations/*`, `llm/policies/*`, injected credential provider, injected provider registry
  - `llm/operations/*` -> `llm/policies/*`, `llm/providers/*`, `llm/schemas/*`, `llm/shared/*`
  - `llm/providers/*` should not depend on controllers or services

Secrets
  - Treat secret lookup as an injected dependency.
  - Concrete secret storage belongs outside this subsystem, typically in `electron/infrastructure/*` when backed by
  Electron or OS facilities.
  - Do not log API keys or return them from this subsystem.

Progress
  - LLM controllers and operations should expose progress through typed callbacks or other injected abstractions.
  - Do not assume `RequestContext` exists inside the subsystem.
  - Services may bridge LLM progress callbacks into request-scoped Electron events when needed.

Testing
  - Put LLM subsystem unit tests near the code they verify, typically in folder-level `__tests__`.
  - Mock provider clients, credential providers, and tool loops in LLM controller/operation tests.
  - Validate structured response parsing and policy resolution precisely.
