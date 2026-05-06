import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivitiesWelcome from "../ActivitiesWelcome";

const useActivityStartMock = vi.fn();

vi.mock("@/app/providers/useActivityStart", () => ({
  useActivityStart: () => useActivityStartMock(),
}));

describe("ActivitiesWelcome", () => {
  const openStartModalMock = vi.fn();
  const closeStartModalMock = vi.fn();
  const confirmStartActivityMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useActivityStartMock.mockReturnValue({
      state: {
        phase: "idle",
        pendingActivityType: null,
      },
      openStartModal: openStartModalMock,
      closeStartModal: closeStartModalMock,
      confirmStartActivity: confirmStartActivityMock,
    });
  });

  it("opens the vocabulary start flow with the expected payload", () => {
    render(<ActivitiesWelcome projectId="project-1" projectName="Corpus Project" />);

    fireEvent.click(screen.getByRole("button", { name: "Create Activity" }));

    expect(openStartModalMock).toHaveBeenCalledWith({
      projectId: "project-1",
      projectName: "Corpus Project",
      activityType: "vocab_activities",
    });
  });

  it("opens the lexical bundles start flow with the expected payload", () => {
    render(<ActivitiesWelcome projectId="project-1" projectName="Corpus Project" />);

    fireEvent.click(screen.getByRole("button", { name: "Create Lexical Bundles" }));

    expect(openStartModalMock).toHaveBeenCalledWith({
      projectId: "project-1",
      projectName: "Corpus Project",
      activityType: "lb_activities",
    });
  });

  it("still renders the activity choices when the provider is confirming", () => {
    useActivityStartMock.mockReturnValue({
      state: {
        phase: "confirming",
        pendingActivityType: "lb_activities",
      },
      openStartModal: openStartModalMock,
      closeStartModal: closeStartModalMock,
      confirmStartActivity: confirmStartActivityMock,
    });

    render(<ActivitiesWelcome projectId="project-1" projectName="Corpus Project" />);

    expect(screen.getByRole("button", { name: "Create Activity" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create Lexical Bundles" })).toBeTruthy();
  });
});
