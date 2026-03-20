import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAppDatabaseMock,
  closeMock,
  runInTransactionMock,
  getRuntimeDbPathMock,
  randomUUIDMock,
  loggerInfoMock,
  findActivityProjectContextRowByProjectUuidMock,
  findActivityTypeRowByActivityTypeMock,
  countActivityRowsByProjectUuidAndTypeMock,
  insertActivityRowMock,
  insertActivitySummaryRowMock,
  listActivityDetailsRowsByProjectUuidMock,
} = vi.hoisted(() => ({
  createAppDatabaseMock: vi.fn(),
  closeMock: vi.fn(),
  runInTransactionMock: vi.fn((_db: unknown, work: () => unknown) => work()),
  getRuntimeDbPathMock: vi.fn(),
  randomUUIDMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  findActivityProjectContextRowByProjectUuidMock: vi.fn(),
  findActivityTypeRowByActivityTypeMock: vi.fn(),
  countActivityRowsByProjectUuidAndTypeMock: vi.fn(),
  insertActivityRowMock: vi.fn(),
  insertActivitySummaryRowMock: vi.fn(),
  listActivityDetailsRowsByProjectUuidMock: vi.fn(),
}));

vi.mock("@electron/db/appDatabase", () => ({
  createAppDatabase: createAppDatabaseMock,
}));

vi.mock("@electron/db/sqlite", () => ({
  runInTransaction: runInTransactionMock,
}));

vi.mock("@electron/runtime/runtimePaths", () => ({
  getRuntimeDbPath: getRuntimeDbPathMock,
}));

vi.mock("node:crypto", () => ({
  randomUUID: randomUUIDMock,
  default: {
    randomUUID: randomUUIDMock,
  },
}));

vi.mock("@electron/services/logger", () => ({
  logger: {
    info: loggerInfoMock,
  },
}));

vi.mock("@electron/db/repositories/activityRepositories", () => ({
  findActivityProjectContextRowByProjectUuid: findActivityProjectContextRowByProjectUuidMock,
  findActivityTypeRowByActivityType: findActivityTypeRowByActivityTypeMock,
  countActivityRowsByProjectUuidAndType: countActivityRowsByProjectUuidAndTypeMock,
  insertActivityRow: insertActivityRowMock,
  insertActivitySummaryRow: insertActivitySummaryRowMock,
  listActivityDetailsRowsByProjectUuid: listActivityDetailsRowsByProjectUuidMock,
}));

import { createActivity, getActivities } from "../requestActivities";

describe("activities services", () => {
  const db = { value: "db" };

  beforeEach(() => {
    createAppDatabaseMock.mockReset();
    closeMock.mockReset();
    runInTransactionMock.mockClear();
    getRuntimeDbPathMock.mockReset();
    randomUUIDMock.mockReset();
    loggerInfoMock.mockReset();
    findActivityProjectContextRowByProjectUuidMock.mockReset();
    findActivityTypeRowByActivityTypeMock.mockReset();
    countActivityRowsByProjectUuidAndTypeMock.mockReset();
    insertActivityRowMock.mockReset();
    insertActivitySummaryRowMock.mockReset();
    listActivityDetailsRowsByProjectUuidMock.mockReset();
    getRuntimeDbPathMock.mockReturnValue("/tmp/runtime.sqlite");
    createAppDatabaseMock.mockReturnValue({
      db,
      close: closeMock,
    });
    randomUUIDMock.mockReturnValueOnce("activity-uuid-1").mockReturnValueOnce("summary-uuid-1");
  });

  it("returns the current activity list for get requests", async () => {
    findActivityProjectContextRowByProjectUuidMock.mockReturnValue({
      project_id: "project-1",
      corpus_id: "corpus-1",
      corpus_name: "BAWE",
      binary_files_path: "/tmp/bawe",
    });
    listActivityDetailsRowsByProjectUuidMock.mockReturnValue([
      {
        activity_id: "activity-1",
        activity_name: "Exploration Activity 1",
        activity_type: "explore_activities",
        activity_type_display_name: "Exploration Activity",
        description: "Explores corpora through interactive activities and analysis.",
      },
      {
        activity_id: "activity-2",
        activity_name: "Lexical Bundles Activity 1",
        activity_type: "lb_activities",
        activity_type_display_name: "Lexical Bundles Activity",
        description: "Samples corpora, extracts lexical bundles and analyzes them.",
      },
    ]);

    const result = await getActivities(
      {
        projectId: "project-1",
      },
      { correlationId: "cid-1", sendEvent: vi.fn() }
    );

    expect(getRuntimeDbPathMock).toHaveBeenCalled();
    expect(createAppDatabaseMock).toHaveBeenCalledWith("/tmp/runtime.sqlite");
    expect(findActivityProjectContextRowByProjectUuidMock).toHaveBeenCalledWith(db, "project-1");
    expect(listActivityDetailsRowsByProjectUuidMock).toHaveBeenCalledWith(db, "project-1");
    expect(result).toEqual({
      projectId: "project-1",
      corpusId: "corpus-1",
      corpusName: "BAWE",
      binaryFilesPath: "/tmp/bawe",
      activities: [
        {
          activityId: "activity-1",
          activityName: "Exploration Activity 1",
          activityType: "explore_activities",
          activityTypeDisplayName: "Exploration Activity",
          description: "Explores corpora through interactive activities and analysis.",
        },
        {
          activityId: "activity-2",
          activityName: "Lexical Bundles Activity 1",
          activityType: "lb_activities",
          activityTypeDisplayName: "Lexical Bundles Activity",
          description: "Samples corpora, extracts lexical bundles and analyzes them.",
        },
      ],
    });
    expect(closeMock).toHaveBeenCalled();
  });

  it("creates a new activity and returns the refreshed full list", async () => {
    findActivityProjectContextRowByProjectUuidMock.mockReturnValue({
      project_id: "project-1",
      corpus_id: "corpus-1",
      corpus_name: "BAWE",
      binary_files_path: "/tmp/bawe",
    });
    findActivityTypeRowByActivityTypeMock.mockReturnValue({
      activity_type: "lb_activities",
      display_name: "Lexical Bundles Activity",
      description: "An activity rendered with the Lexical Bundles Activities UI",
    });
    countActivityRowsByProjectUuidAndTypeMock.mockReturnValue(1);
    listActivityDetailsRowsByProjectUuidMock.mockReturnValue([
      {
        activity_id: "activity-1",
        activity_name: "Exploration Activity 1",
        activity_type: "explore_activities",
        activity_type_display_name: "Exploration Activity",
        description: "Explores corpora through interactive activities and analysis.",
      },
      {
        activity_id: "activity-2",
        activity_name: "Lexical Bundles Activity 1",
        activity_type: "lb_activities",
        activity_type_display_name: "Lexical Bundles Activity",
        description: "Samples corpora, extracts lexical bundles and analyzes them.",
      },
      {
        activity_id: "activity-uuid-1",
        activity_name: "Lexical Bundles Activity 2",
        activity_type: "lb_activities",
        activity_type_display_name: "Lexical Bundles Activity",
        description: "Samples corpora, extracts lexical bundles and analyzes them.",
      },
    ]);

    const result = await createActivity(
      {
        projectId: "project-1",
        activityType: "lb_activities",
      },
      { correlationId: "cid-2", sendEvent: vi.fn() }
    );

    expect(runInTransactionMock).toHaveBeenCalled();
    expect(findActivityTypeRowByActivityTypeMock).toHaveBeenCalledWith(db, "lb_activities");
    expect(countActivityRowsByProjectUuidAndTypeMock).toHaveBeenCalledWith(db, "project-1", "lb_activities");
    expect(insertActivityRowMock).toHaveBeenCalledWith(db, expect.objectContaining({
      uuid: "activity-uuid-1",
      corpus_uuid: "corpus-1",
      activity_name: "Lexical Bundles Activity 2",
      activity_type: "lb_activities",
    }));
    expect(insertActivitySummaryRowMock).toHaveBeenCalledWith(db, expect.objectContaining({
      uuid: "summary-uuid-1",
      activity_uuid: "activity-uuid-1",
      description: "Samples corpora, extracts lexical bundles and analyzes them.",
    }));
    expect(result.activities).toHaveLength(3);
    expect(result.activities[2]).toEqual({
      activityId: "activity-uuid-1",
      activityName: "Lexical Bundles Activity 2",
      activityType: "lb_activities",
      activityTypeDisplayName: "Lexical Bundles Activity",
      description: "Samples corpora, extracts lexical bundles and analyzes them.",
    });
    expect(closeMock).toHaveBeenCalled();
  });
});
