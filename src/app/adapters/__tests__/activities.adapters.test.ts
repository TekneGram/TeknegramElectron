import { describe, expect, it, vi, beforeEach } from "vitest";
import { activitiesAdapter } from "../activities.adapters";

const invokeMock = vi.fn();

vi.mock("../invokeRequest", () => ({
  invokeRequest: (...args: unknown[]) => invokeMock(...args),
}));

describe("activities adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("routes get and create requests through the shared activities request channel", async () => {
    invokeMock.mockResolvedValue({ ok: true, value: null });

    await activitiesAdapter.getActivities({
      projectId: "project-1",
      activityType: "lb_activities",
      requestType: "get",
    });

    await activitiesAdapter.createActivity({
      projectId: "project-1",
      activityType: "lb_activities",
      requestType: "create",
    });

    expect(invokeMock).toHaveBeenNthCalledWith(1, "activities:request", {
      projectId: "project-1",
      activityType: "lb_activities",
      requestType: "get",
    });
    expect(invokeMock).toHaveBeenNthCalledWith(2, "activities:request", {
      projectId: "project-1",
      activityType: "lb_activities",
      requestType: "create",
    });
  });
});
