import { describe, expectTypeOf, it, vi } from "vitest";
import type { NotifierPort } from "../notifications";

describe("notifier port contracts", () => {
  it("accepts error and success methods with optional id options", () => {
    const port: NotifierPort = {
      error: vi.fn(),
      success: vi.fn(),
    };

    port.error("Something failed");
    port.error("Something failed", { id: "error-1" });
    port.success("Completed");
    port.success("Completed", { id: "success-1" });

    expectTypeOf(port).toEqualTypeOf<NotifierPort>();
  });

  it("rejects invalid notifier option shapes", () => {
    const invalidPort: NotifierPort = {
      error(
        _message,
        // @ts-expect-error id must be a string when provided
        _opts = { id: 123 },
      ) {},
      success(_message, _opts) {},
    };

    expectTypeOf(invalidPort).toEqualTypeOf<NotifierPort>();
  });
});
