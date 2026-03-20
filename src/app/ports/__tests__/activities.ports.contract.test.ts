import { describe, expectTypeOf, it } from "vitest";
import type {
  ActivitiesPort,
  ActivityDetails,
  ActivityRequest,
  ActivityResponse,
  ActivityType,
} from "../activities.ports";
import type { AppResult } from "@/app/types/result";

describe("activities port contracts", () => {
  it("accepts the expected request and response shapes", () => {
    const activityType: ActivityType = "lb_activities";

    const request: ActivityRequest = {
      projectId: "project-1",
      activityType,
      requestType: "get",
    };

    const activity: ActivityDetails = {
      activityId: "activity-1",
      activityName: "Lexical Bundles Activity 1",
      activityType,
      activityTypeDisplayName: "Lexical Bundles Activity",
      description: "Samples corpora, extracts lexical bundles and analyzes them.",
    };

    const response: ActivityResponse = {
      corpusId: "corpus-1",
      projectId: "project-1",
      corpusName: "Main Corpus",
      binaryFilesPath: "/tmp/corpus/bin",
      activities: [activity],
    };

    expectTypeOf(request).toEqualTypeOf<ActivityRequest>();
    expectTypeOf(activity).toEqualTypeOf<ActivityDetails>();
    expectTypeOf(response).toEqualTypeOf<ActivityResponse>();
  });

  it("requires activities port methods to return AppResult-wrapped promises", async () => {
    const port: ActivitiesPort = {
      async getActivities(request) {
        void request;
        return {
          ok: true,
          value: {
            corpusId: "corpus-1",
            projectId: "project-1",
            corpusName: "Main Corpus",
            binaryFilesPath: "/tmp/corpus/bin",
            activities: [],
          },
        };
      },
      async createActivity(request) {
        void request;
        return {
          ok: true,
          value: {
            corpusId: "corpus-1",
            projectId: "project-1",
            corpusName: "Main Corpus",
            binaryFilesPath: "/tmp/corpus/bin",
            activities: [],
          },
        };
      },
    };

    const getResult = await port.getActivities({
      projectId: "project-1",
      activityType: "lb_activities",
      requestType: "get",
    });
    const createResult = await port.createActivity({
      projectId: "project-1",
      activityType: "lb_activities",
      requestType: "create",
    });

    expectTypeOf(getResult).toEqualTypeOf<AppResult<ActivityResponse>>();
    expectTypeOf(createResult).toEqualTypeOf<AppResult<ActivityResponse>>();
  });
});
