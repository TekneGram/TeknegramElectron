import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivityCard from "../ActivityCard";

const useNavigationMock = vi.fn();
const dispatchMock = vi.fn();

vi.mock("@/app/providers/useNavigation", () => ({
  useNavigation: () => useNavigationMock(),
}));

describe("ActivityCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigationMock.mockReturnValue({
      dispatch: dispatchMock,
    });
  });

  it("dispatches open-analysis for entered activity regardless of type", () => {
    const activityParentContext = {
      corpusId: "corpus-1",
      projectId: "project-1",
      corpusName: "Main Corpus",
      binaryFilesPath: "/tmp/corpus/bin",
    };
    const activityDetails = {
      activityId: "activity-1",
      activityName: "Dependency Activity 1",
      activityType: "dependency_activities" as const,
      activityTypeDisplayName: "Dependency Activity",
      description: "Inspects syntactic dependency patterns across corpus texts.",
    };

    render(
      <ActivityCard
        activityParentContext={activityParentContext}
        activityDetails={activityDetails}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Enter" }));

    expect(dispatchMock).toHaveBeenCalledWith({
      type: "open-analysis",
      activityDetails,
      activityParentContext,
    });
  });
});
