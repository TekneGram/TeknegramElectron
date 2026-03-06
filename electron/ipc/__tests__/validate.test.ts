import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AppException } from "../../core/appException";
import { formatValidationIssues, validateOrThrow } from "../validate";

describe("validateOrThrow", () => {
  const schema = z.object({
    id: z.string().min(1),
  });

  it("returns parsed values for valid inputs", () => {
    const parsed = validateOrThrow(schema, { id: "abc" });
    expect(parsed).toEqual({ id: "abc" });
  });

  it("throws AppException for invalid inputs", () => {
    expect(() => validateOrThrow(schema, { id: "" })).toThrow(AppException);
  });
});

describe("formatValidationIssues", () => {
  it("formats issue paths and messages", () => {
    const details = formatValidationIssues([
      { path: ["id"], message: "Too short" },
      { path: ["name"], message: "Required" },
    ]);

    expect(details).toContain("id: Too short");
    expect(details).toContain("name: Required");
  });
});
