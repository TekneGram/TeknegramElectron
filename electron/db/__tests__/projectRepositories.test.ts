import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryAllMock, executeRunMock, queryOneMock } = vi.hoisted(() => ({
  queryAllMock: vi.fn(),
  executeRunMock: vi.fn(),
  queryOneMock: vi.fn(),
}));

vi.mock("../sqlite", () => ({
  queryAll: queryAllMock,
  executeRun: executeRunMock,
  queryOne: queryOneMock,
}));

import {
  deleteProjectRow,
  findProjectDeleteTargetRow,
  insertCorpus,
  insertCorpusFilePath,
  insertProject,
  listProjectRows,
} from "../repositories/projectRepositories";

describe("projectRepositories", () => {
  const db = { name: "mock-db" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates project listing to queryAll with the expected SQL", () => {
    const rows = [
      {
        uuid: "22222222-2222-2222-2222-222222222222",
        project_name: "Newer",
        created_at: "2024-01-02T00:00:00.000Z",
      },
    ];
    queryAllMock.mockReturnValue(rows);

    expect(listProjectRows(db as never)).toEqual(rows);
    expect(queryAllMock).toHaveBeenCalledWith(
      db,
      expect.stringContaining("SELECT uuid, project_name, created_at"),
    );
    expect(queryAllMock).toHaveBeenCalledWith(
      db,
      expect.stringContaining("ORDER BY created_at DESC"),
    );
  });

  it("delegates project inserts to executeRun with the expected parameters", () => {
    insertProject(db as never, {
      uuid: "11111111-1111-1111-1111-111111111111",
      project_name: "Project A",
      created_at: "2024-01-01T00:00:00.000Z",
    });

    expect(executeRunMock).toHaveBeenCalledWith(
      db,
      expect.stringContaining("INSERT INTO projects"),
      ["11111111-1111-1111-1111-111111111111", "Project A", "2024-01-01T00:00:00.000Z"],
    );
  });

  it("delegates corpus inserts to executeRun with the expected parameters", () => {
    insertCorpus(db as never, {
      uuid: "33333333-3333-3333-3333-333333333333",
      project_uuid: "11111111-1111-1111-1111-111111111111",
      corpus_name: "Corpus A",
      created_at: "2024-01-03T00:00:00.000Z",
    });

    expect(executeRunMock).toHaveBeenCalledWith(
      db,
      expect.stringContaining("INSERT INTO corpora"),
      [
        "33333333-3333-3333-3333-333333333333",
        "11111111-1111-1111-1111-111111111111",
        "Corpus A",
        "2024-01-03T00:00:00.000Z",
      ],
    );
  });

  it("delegates corpus file path inserts to executeRun with the expected parameters", () => {
    insertCorpusFilePath(db as never, {
      uuid: "44444444-4444-4444-4444-444444444444",
      corpus_uuid: "33333333-3333-3333-3333-333333333333",
      binary_files_path: "/tmp/corpus.bin",
      created_at: "2024-01-04T00:00:00.000Z",
    });

    expect(executeRunMock).toHaveBeenCalledWith(
      db,
      expect.stringContaining("INSERT INTO corpus_files_path"),
      [
        "44444444-4444-4444-4444-444444444444",
        "33333333-3333-3333-3333-333333333333",
        "/tmp/corpus.bin",
        "2024-01-04T00:00:00.000Z",
      ],
    );
  });

  it("queries the delete target row with the expected join", () => {
    const row = {
      project_uuid: "11111111-1111-1111-1111-111111111111",
      corpus_uuid: "22222222-2222-2222-2222-222222222222",
      binary_files_path: "/tmp/corpus-a",
    };
    queryOneMock.mockReturnValue(row);

    expect(findProjectDeleteTargetRow(db as never, row.project_uuid)).toEqual(row);
    expect(queryOneMock).toHaveBeenCalledWith(
      db,
      expect.stringContaining("INNER JOIN corpora"),
      [row.project_uuid]
    );
  });

  it("delegates project deletes to executeRun with the expected parameters", () => {
    deleteProjectRow(db as never, "11111111-1111-1111-1111-111111111111");

    expect(executeRunMock).toHaveBeenCalledWith(
      db,
      expect.stringContaining("DELETE FROM projects"),
      ["11111111-1111-1111-1111-111111111111"]
    );
  });
});
