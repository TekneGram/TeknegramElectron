import { describe, expect, it } from "vitest";
import { mapBackendError } from "../invokeRequest";

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
});
