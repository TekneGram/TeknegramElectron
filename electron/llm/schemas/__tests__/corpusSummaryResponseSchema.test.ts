import { describe, expect, it } from "vitest";

import { corpusSummaryResponseSchema } from "../corpusSummaryResponseSchema";

describe("corpusSummaryResponseSchema", () => {
  it("accepts summaries up to ten sentences", () => {
    const result = corpusSummaryResponseSchema.parse({
      summary: [
        "Sentence one.",
        "Sentence two.",
        "Sentence three.",
        "Sentence four.",
        "Sentence five.",
        "Sentence six.",
        "Sentence seven.",
        "Sentence eight.",
        "Sentence nine.",
        "Sentence ten.",
      ].join(" "),
    });

    expect(result.summary).toContain("Sentence ten.");
  });

  it("rejects summaries longer than ten sentences", () => {
    expect(() =>
      corpusSummaryResponseSchema.parse({
        summary: [
          "One.",
          "Two.",
          "Three.",
          "Four.",
          "Five.",
          "Six.",
          "Seven.",
          "Eight.",
          "Nine.",
          "Ten.",
          "Eleven.",
        ].join(" "),
      })
    ).toThrow("Summary must contain between 2 and 10 sentences.");
  });
});
