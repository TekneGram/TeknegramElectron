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
    });

    await activitiesAdapter.createActivity({
      projectId: "project-1",
      activityType: "lb_activities",
    });

    expect(invokeMock).toHaveBeenNthCalledWith(1, "activities:get", {
      projectId: "project-1",
    });
    expect(invokeMock).toHaveBeenNthCalledWith(2, "activities:create", {
      projectId: "project-1",
      activityType: "lb_activities",
    });
  });
});
