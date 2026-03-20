import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivitiesView from "../ActivitiesView";

const activityCardMock = vi.fn();
const dispatchMock = vi.fn();
const navigationMock = vi.fn();
const activitiesQueryMock = vi.fn();
const createActivityMutationMock = vi.fn();

vi.mock("@/app/providers/useNavigation", () => ({
  useNavigation: () => navigationMock(),
}));

vi.mock("@/features/Activities/hooks/useActivitiesQuery", () => ({
  useActivitiesQuery: (...args: unknown[]) => activitiesQueryMock(...args),
}));

vi.mock("@/features/Activities/hooks/useCreateActivityMutation", () => ({
  useCreateActivityMutation: () => createActivityMutationMock(),
}));

vi.mock("@/features/ActivityCard/ActivityCard", () => ({
  default: (props: {
    activityName: string;
    activityTypeDisplayName: string;
    description: string;
  }) => {
    activityCardMock(props);
    return <div data-testid="activity-card">{props.activityName}</div>;
  },
}));

describe("ActivitiesView", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    navigationMock.mockReturnValue({
      navigationState: {
        kind: "activities",
        projectId: "project-1",
        projectName: "Corpus Project",
      },
      dispatch: dispatchMock,
    });
    createActivityMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
    activitiesQueryMock.mockReturnValue({
      data: {
        corpusId: "corpus-1",
        projectId: "project-1",
        corpusName: "Main Corpus",
        binaryFilesPath: "/tmp/corpus/bin",
        activities: [],
      },
      isLoading: false,
      isError: false,
    });
  });

  it("renders the empty state when no activities exist", () => {
    render(<ActivitiesView />);

    expect(screen.getByText("Exploration Activities")).toBeTruthy();
    expect(screen.getByText("Lexical Bundles")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start Lexical Bundles" })).toBeTruthy();
  });

  it("renders the populated state with corpus name and cards", () => {
    activitiesQueryMock.mockReturnValue({
      data: {
        corpusId: "corpus-1",
        projectId: "project-1",
        corpusName: "Main Corpus",
        binaryFilesPath: "/tmp/corpus/bin",
        activities: [
          {
            activityId: "activity-1",
            activityName: "Lexical Bundles Activity 1",
            activityType: "lb_activities",
            activityTypeDisplayName: "Lexical Bundles Activity",
            description: "Samples corpora, extracts lexical bundles and analyzes them.",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<ActivitiesView />);

    expect(screen.getByText("Main Corpus")).toBeTruthy();
    expect(screen.getByTestId("activity-card")).toBeTruthy();
    expect(activityCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        activityName: "Lexical Bundles Activity 1",
      }),
    );
  });

  it("renders the loading transition while data is being fetched", () => {
    activitiesQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<ActivitiesView />);

    expect(screen.getByText("Loading activities.")).toBeTruthy();
    expect(screen.getByText("Gathering activity data...")).toBeTruthy();
  });

  it("creates a lexical bundles activity and navigates to analysis", async () => {
    mutateAsyncMock.mockResolvedValue({
      corpusId: "corpus-1",
      projectId: "project-1",
      corpusName: "Main Corpus",
      binaryFilesPath: "/tmp/corpus/bin",
      activities: [
        {
          activityId: "activity-1",
          activityName: "Lexical Bundles Activity 1",
          activityType: "lb_activities",
          activityTypeDisplayName: "Lexical Bundles Activity",
          description: "Samples corpora, extracts lexical bundles and analyzes them.",
        },
      ],
    });
    activitiesQueryMock.mockReturnValue({
      data: {
        corpusId: "corpus-1",
        projectId: "project-1",
        corpusName: "Main Corpus",
        binaryFilesPath: "/tmp/corpus/bin",
        activities: [],
      },
      isLoading: false,
      isError: false,
    });

    render(<ActivitiesView />);

    fireEvent.click(screen.getByRole("button", { name: "Start Lexical Bundles" }));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      projectId: "project-1",
      activityType: "lb_activities",
      requestType: "create",
    });

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith({
        type: "open-analysis",
        projectId: "project-1",
        activityId: "activity-1",
        activityType: "lb_activities",
      });
    });
  });
});
