import { describe, expect, it } from "vitest";
import { createAppDatabase } from "../appDatabase";
import { createTempDir } from "./testDb";

describe("createAppDatabase", () => {
  it("returns an open database and closes it through the wrapper", () => {
    const tempDir = createTempDir();
    const database = createAppDatabase(`${tempDir}/app.sqlite`);

    expect(database.db.open).toBe(true);

    database.close();

    expect(database.db.open).toBe(false);
  });
});
