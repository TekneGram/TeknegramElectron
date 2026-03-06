import { describe, expect, it } from "vitest";
import { toErrorResult } from "../safeHandle";

describe("toErrorResult", () => {
  it("attaches correlation id and preserves app error code", () => {
    const result = toErrorResult(
      { code: "DB_QUERY_FAILED", message: "Query failed", details: "SQLITE_BUSY" },
      "cid-123"
    );

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe("DB_QUERY_FAILED");
    expect(result.error.message).toBe("Query failed");
    expect(result.error.correlationId).toBe("cid-123");
  });

  it("falls back to provided code for unknown errors", () => {
    const result = toErrorResult(new Error("Boom"), "cid-456", "INTERNAL_UNEXPECTED");

    expect(result.ok).toBe(false);
    expect(result.error.code).toBe("INTERNAL_UNEXPECTED");
    expect(result.error.correlationId).toBe("cid-456");
  });
});
