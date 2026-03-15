import type { AppError, AppResult } from "../types/result";

type BackendErrorDto = {
  code: string;
  message: string;
  details?: string;
  correlationId?: string;
};

type BackendResultDto<T> =
  | { ok: true; data: T }
  | { ok: false; error: BackendErrorDto };

export function mapBackendError(dto: BackendErrorDto): AppError {
  switch (dto.code) {
    case "VALIDATION_INVALID_PAYLOAD": return { kind: "validation", userMessage: dto.message, debugId: dto.correlationId };
    case "VALIDATION_MISSING_FIELD": return { kind: "validation", userMessage: dto.message, debugId: dto.correlationId };
    case "VALIDATION_INVALID_STATE": return { kind: "validation", userMessage: dto.message, debugId: dto.correlationId };
    case "CPP_PROCESS_SPAWN_FAILED": return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "CPP_PROCESS_NON_ZERO_EXIT": return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "CPP_PROCESS_TIMEOUT": return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "CPP_PROCESS_CANCELLED": return { kind: "cancelled", userMessage: dto.message, debugId: dto.correlationId };
    case "DB_CONNECTION_FAILED": return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "DB_QUERY_FAILED": return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "DB_CONSTRAINT_VIOLATION": return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "RESOURCE_NOT_FOUND": return { kind: "validation", userMessage: dto.message, debugId: dto.correlationId };
    case "FS_NOT_FOUND": return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "FS_WRITE_FAILED": return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "IPC_CHANNEL_NOT_FOUND": return { kind: "infrastructure", userMessage: dto.message, debugId: dto.correlationId };
    case "IPC_HANDLER_FAILED": return { kind: "infrastructure", userMessage: dto.message, debugId: dto.correlationId };
    case "NETWORK_UNAVAILABLE": return { kind: "infrastructure", userMessage: dto.message, debugId: dto.correlationId };
    case "NETWORK_TIMEOUT": return { kind: "infrastructure", userMessage: dto.message, debugId: dto.correlationId };
    case "DEPENDENCY_UNAVAILABLE":
      return {
        kind: "infrastructure",
        userMessage: "Request failed. Please try again.",
        debugId: dto.correlationId,
      };
    default:
      return {
        kind: "unknown",
        userMessage: "Unexpected error occurred.",
        debugId: dto.correlationId,
      };
  }
}

export async function invokeRequest<TReq, TRes>(
  channel: string,
  payload: TReq
): Promise<AppResult<TRes>> {
  const result = await window.api.invoke<BackendResultDto<TRes>>(channel, payload);

  if (!result.ok) {
    return { ok: false, error: mapBackendError(result.error) };
  }

  return { ok: true, value: result.data };
}
