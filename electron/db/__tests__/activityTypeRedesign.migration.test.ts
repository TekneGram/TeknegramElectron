import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("0009 activity type redesign migration", () => {
  it("includes inserts for new activity types plus explore-to-vocab conversion and cleanup", () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), "electron", "db", "migration", "0009_activity_type_redesign.sql"),
      "utf8",
    );

    expect(sql).toContain("'vocab_activities'");
    expect(sql).toContain("'collocation_activities'");
    expect(sql).toContain("'dependency_activities'");
    expect(sql).toContain("UPDATE activities");
    expect(sql).toContain("SET");
    expect(sql).toContain("activity_type = 'vocab_activities'");
    expect(sql).toContain("WHERE activity_type = 'explore_activities'");
    expect(sql).toContain("DELETE FROM activity_types");
  });
});
