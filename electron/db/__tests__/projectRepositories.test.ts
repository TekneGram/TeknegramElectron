import { describe, expect, it } from "vitest";
import {
  insertCorpus,
  insertCorpusFilePath,
  insertProject,
  listProjectRows,
} from "../repositories/projectRepositories";
import { createTempDatabase, applyCoreSchema } from "./testDb";

describe("projectRepositories", () => {
  it("inserts projects and lists them by created_at descending", () => {
    const { db } = createTempDatabase();
    applyCoreSchema(db);

    insertProject(db, {
      uuid: "11111111-1111-1111-1111-111111111111",
      project_name: "Older",
      created_at: "2024-01-01T00:00:00.000Z",
    });
    insertProject(db, {
      uuid: "22222222-2222-2222-2222-222222222222",
      project_name: "Newer",
      created_at: "2024-01-02T00:00:00.000Z",
    });

    expect(listProjectRows(db)).toEqual([
      {
        uuid: "22222222-2222-2222-2222-222222222222",
        project_name: "Newer",
        created_at: "2024-01-02T00:00:00.000Z",
      },
      {
        uuid: "11111111-1111-1111-1111-111111111111",
        project_name: "Older",
        created_at: "2024-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("writes project, corpus, and file path rows with the expected shape", () => {
    const { db } = createTempDatabase();
    applyCoreSchema(db);

    insertProject(db, {
      uuid: "11111111-1111-1111-1111-111111111111",
      project_name: "Project A",
      created_at: "2024-01-01T00:00:00.000Z",
    });
    insertCorpus(db, {
      uuid: "33333333-3333-3333-3333-333333333333",
      project_uuid: "11111111-1111-1111-1111-111111111111",
      corpus_name: "Corpus A",
      created_at: "2024-01-03T00:00:00.000Z",
    });
    insertCorpusFilePath(db, {
      uuid: "44444444-4444-4444-4444-444444444444",
      corpus_uuid: "33333333-3333-3333-3333-333333333333",
      binary_files_path: "/tmp/corpus.bin",
      created_at: "2024-01-04T00:00:00.000Z",
    });

    expect(db.prepare("SELECT * FROM projects").get()).toEqual({
      uuid: "11111111-1111-1111-1111-111111111111",
      project_name: "Project A",
      created_at: "2024-01-01T00:00:00.000Z",
    });
    expect(db.prepare("SELECT * FROM corpora").get()).toEqual({
      uuid: "33333333-3333-3333-3333-333333333333",
      project_uuid: "11111111-1111-1111-1111-111111111111",
      corpus_name: "Corpus A",
      created_at: "2024-01-03T00:00:00.000Z",
    });
    expect(db.prepare("SELECT * FROM corpus_files_path").get()).toEqual({
      uuid: "44444444-4444-4444-4444-444444444444",
      corpus_uuid: "33333333-3333-3333-3333-333333333333",
      binary_files_path: "/tmp/corpus.bin",
      created_at: "2024-01-04T00:00:00.000Z",
    });
  });

  it("enforces the project foreign key when inserting a corpus", () => {
    const { db } = createTempDatabase();
    applyCoreSchema(db);

    expect(() =>
      insertCorpus(db, {
        uuid: "33333333-3333-3333-3333-333333333333",
        project_uuid: "99999999-9999-9999-9999-999999999999",
        corpus_name: "Orphan corpus",
        created_at: "2024-01-03T00:00:00.000Z",
      })
    ).toThrow(/foreign key/i);
  });

  it("enforces the corpus foreign key when inserting a file path", () => {
    const { db } = createTempDatabase();
    applyCoreSchema(db);

    expect(() =>
      insertCorpusFilePath(db, {
        uuid: "44444444-4444-4444-4444-444444444444",
        corpus_uuid: "99999999-9999-9999-9999-999999999999",
        binary_files_path: "/tmp/corpus.bin",
        created_at: "2024-01-04T00:00:00.000Z",
      })
    ).toThrow(/foreign key/i);
  });
});
