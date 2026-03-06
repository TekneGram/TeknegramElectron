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
    case "VALIDATION_INVALID_PAYLOAD":
    case "VALIDATION_MISSING_FIELD":
    case "VALIDATION_INVALID_STATE":
      return { kind: "validation", userMessage: dto.message, debugId: dto.correlationId };
    case "CPP_PROCESS_SPAWN_FAILED":
    case "CPP_PROCESS_NON_ZERO_EXIT":
    case "CPP_PROCESS_TIMEOUT":
    case "DB_CONNECTION_FAILED":
    case "DB_QUERY_FAILED":
    case "DB_CONSTRAINT_VIOLATION":
      return { kind: "processing", userMessage: dto.message, debugId: dto.correlationId };
    case "IPC_CHANNEL_NOT_FOUND":
    case "IPC_HANDLER_FAILED":
    case "NETWORK_UNAVAILABLE":
    case "NETWORK_TIMEOUT":
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
