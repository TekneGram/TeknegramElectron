import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivitiesControls from "../ActivitiesControls";

const useNavigationMock = vi.fn();
const useActivityStartMock = vi.fn();

vi.mock("@/app/providers/useNavigation", () => ({
  useNavigation: () => useNavigationMock(),
}));

vi.mock("@/app/providers/useActivityStart", () => ({
  useActivityStart: () => useActivityStartMock(),
}));

describe("ActivitiesControls", () => {
  const openStartModalMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigationMock.mockReturnValue({
      navigationState: {
        kind: "activities",
        projectId: "project-1",
        projectName: "Corpus Project",
      },
    });
    useActivityStartMock.mockReturnValue({
      openStartModal: openStartModalMock,
    });
  });

  it("returns null outside activities route", () => {
    useNavigationMock.mockReturnValue({
      navigationState: { kind: "home" },
    });

    const { container } = render(<ActivitiesControls />);

    expect(container.innerHTML).toBe("");
  });

  it("dispatches the vocabulary create flow", () => {
    render(<ActivitiesControls />);
    fireEvent.click(screen.getByRole("button", { name: "Vocabulary Analysis" }));

    expect(openStartModalMock).toHaveBeenCalledWith({
      projectId: "project-1",
      projectName: "Corpus Project",
      activityType: "vocab_activities",
    });
  });

  it("dispatches the collocation create flow", () => {
    render(<ActivitiesControls />);
    fireEvent.click(screen.getByRole("button", { name: "Collocation Analysis" }));

    expect(openStartModalMock).toHaveBeenCalledWith({
      projectId: "project-1",
      projectName: "Corpus Project",
      activityType: "collocation_activities",
    });
  });

  it("dispatches the dependency create flow", () => {
    render(<ActivitiesControls />);
    fireEvent.click(screen.getByRole("button", { name: "Dependency Analysis" }));

    expect(openStartModalMock).toHaveBeenCalledWith({
      projectId: "project-1",
      projectName: "Corpus Project",
      activityType: "dependency_activities",
    });
  });

  it("dispatches the lexical bundles create flow", () => {
    render(<ActivitiesControls />);
    fireEvent.click(screen.getByRole("button", { name: "Lexical Bundles Analysis" }));

    expect(openStartModalMock).toHaveBeenCalledWith({
      projectId: "project-1",
      projectName: "Corpus Project",
      activityType: "lb_activities",
    });
  });
});
