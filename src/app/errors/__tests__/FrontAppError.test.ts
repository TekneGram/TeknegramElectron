import { describe, expect, it } from "vitest";
import { FrontAppError, isFrontAppError } from "../FrontAppError";

describe("FrontAppError", () => {
  it("copies message, name, kind, and debugId from the app error", () => {
    const error = new FrontAppError({
      kind: "processing",
      userMessage: "Build failed",
      debugId: "cid-1",
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(FrontAppError);
    expect(error.message).toBe("Build failed");
    expect(error.name).toBe("FrontAppError");
    expect(error.kind).toBe("processing");
    expect(error.debugId).toBe("cid-1");
  });

  it("leaves debugId undefined when the app error does not include one", () => {
    const error = new FrontAppError({
      kind: "validation",
      userMessage: "Invalid payload",
    });

    expect(error.message).toBe("Invalid payload");
    expect(error.kind).toBe("validation");
    expect(error.debugId).toBeUndefined();
  });
});

describe("isFrontAppError", () => {
  it("returns true for FrontAppError instances", () => {
    const error = new FrontAppError({
      kind: "cancelled",
      userMessage: "Cancelled",
      debugId: "cid-2",
    });

    expect(isFrontAppError(error)).toBe(true);
  });

  it("returns false for plain Error instances", () => {
    expect(isFrontAppError(new Error("Build failed"))).toBe(false);
  });

  it("returns false for plain objects with a similar shape", () => {
    expect(
      isFrontAppError({
        name: "FrontAppError",
        message: "Build failed",
        kind: "processing",
        debugId: "cid-3",
      }),
    ).toBe(false);
  });

  it("returns false for primitive values", () => {
    expect(isFrontAppError("Build failed")).toBe(false);
  });
});
