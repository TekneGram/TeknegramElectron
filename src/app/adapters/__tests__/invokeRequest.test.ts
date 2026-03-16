import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeRequest, mapBackendError } from "../invokeRequest";

describe("mapBackendError", () => {
  it("maps validation errors", () => {
    const mapped = mapBackendError({
      code: "VALIDATION_INVALID_PAYLOAD",
      message: "Invalid payload",
      correlationId: "cid-1",
    });

    expect(mapped.kind).toBe("validation");
    expect(mapped.userMessage).toBe("Invalid payload");
    expect(mapped.debugId).toBe("cid-1");
  });

  it("maps unknown codes to unknown kind", () => {
    const mapped = mapBackendError({
      code: "SOMETHING_ELSE",
      message: "Oops",
      correlationId: "cid-2",
    });

    expect(mapped.kind).toBe("unknown");
    expect(mapped.debugId).toBe("cid-2");
  });

  it("maps processing errors", () => {
    const mapped = mapBackendError({
      code: "CPP_PROCESS_TIMEOUT",
      message: "Timed out",
      correlationId: "cid-3",
    });

    expect(mapped).toEqual({
      kind: "processing",
      userMessage: "Timed out",
      debugId: "cid-3",
    });
  });

  it("maps cancelled errors", () => {
    const mapped = mapBackendError({
      code: "CPP_PROCESS_CANCELLED",
      message: "Cancelled",
      correlationId: "cid-4",
    });

    expect(mapped).toEqual({
      kind: "cancelled",
      userMessage: "Cancelled",
      debugId: "cid-4",
    });
  });

  it("maps infrastructure errors", () => {
    const mapped = mapBackendError({
      code: "IPC_HANDLER_FAILED",
      message: "IPC failed",
      correlationId: "cid-5",
    });

    expect(mapped).toEqual({
      kind: "infrastructure",
      userMessage: "IPC failed",
      debugId: "cid-5",
    });
  });

  it("uses the fallback message for dependency unavailable errors", () => {
    const mapped = mapBackendError({
      code: "DEPENDENCY_UNAVAILABLE",
      message: "Database is down",
      correlationId: "cid-6",
    });

    expect(mapped).toEqual({
      kind: "infrastructure",
      userMessage: "Request failed. Please try again.",
      debugId: "cid-6",
    });
  });

  it("maps filesystem and resource errors", () => {
    expect(
      mapBackendError({
        code: "RESOURCE_NOT_FOUND",
        message: "Missing project",
        correlationId: "cid-8",
      })
    ).toEqual({
      kind: "validation",
      userMessage: "Missing project",
      debugId: "cid-8",
    });

    expect(
      mapBackendError({
        code: "FS_WRITE_FAILED",
        message: "Cleanup failed",
        correlationId: "cid-9",
      })
    ).toEqual({
      kind: "processing",
      userMessage: "Cleanup failed",
      debugId: "cid-9",
    });
  });
});

describe("invokeRequest", () => {
  const invoke = vi.fn();

  beforeEach(() => {
    invoke.mockReset();
    vi.stubGlobal("window", {
      api: {
        invoke,
        onProjectCreationProgress: vi.fn(),
        onProjectCorpusMetadataProgress: vi.fn(),
      },
    });
  });

  it("passes the channel and payload to window.api.invoke", async () => {
    const payload = { requestId: "req-1" };
    invoke.mockResolvedValue({ ok: true, data: { done: true } });

    await invokeRequest("projects:create", payload);

    expect(invoke).toHaveBeenCalledWith("projects:create", payload);
  });

  it("maps successful backend responses to AppResult success", async () => {
    invoke.mockResolvedValue({
      ok: true,
      data: { projectUuid: "project-1" },
    });

    await expect(invokeRequest("projects:create", { requestId: "req-1" })).resolves.toEqual({
      ok: true,
      value: { projectUuid: "project-1" },
    });
  });

  it("maps failed backend responses to AppResult failure", async () => {
    invoke.mockResolvedValue({
      ok: false,
      error: {
        code: "NETWORK_TIMEOUT",
        message: "The request timed out",
        correlationId: "cid-7",
      },
    });

    await expect(invokeRequest("projects:list", null)).resolves.toEqual({
      ok: false,
      error: {
        kind: "infrastructure",
        userMessage: "The request timed out",
        debugId: "cid-7",
      },
    });
  });
});
