import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivitiesView from "../ActivitiesView";

const activitiesMock = vi.fn();
const dispatchMock = vi.fn();
const navigationMock = vi.fn();
const activitiesQueryMock = vi.fn();
const createActivityMutationMock = vi.fn();

vi.mock("@/app/providers/useNavigation", () => ({
  useNavigation: () => navigationMock(),
}));

vi.mock("@/layout/MainView/Activities/hooks/useActivitiesQuery", () => ({
  useActivitiesQuery: (...args: unknown[]) => activitiesQueryMock(...args),
}));

vi.mock("@/layout/MainView/Activities/hooks/useCreateActivityMutation", () => ({
  useCreateActivityMutation: () => createActivityMutationMock(),
}));

vi.mock("@/layout/MainView/Activities/Activities", () => ({
  default: (props: { activities: Array<{ activityName: string }>; corpusName: string }) => {
    activitiesMock(props);
    return <div data-testid="activities-list">{props.corpusName}:{props.activities.map((activity) => activity.activityName).join(",")}</div>;
  },
}));

vi.mock("@/layout/MainView/Activities/ActivitiesWelcome", () => ({
  default: (props: { projectName: string; onStartLexicalBundlesActivity: () => void }) => (
    <div>
      <span>{props.projectName}</span>
      <button onClick={() => { void props.onStartLexicalBundlesActivity(); }}>Start Lexical Bundles</button>
    </div>
  ),
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

    expect(screen.getByText("Corpus Project")).toBeTruthy();
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
      },
      isLoading: false,
      isError: false,
    });

    render(<ActivitiesView />);

    expect(screen.getByTestId("activities-list")).toBeTruthy();
    expect(screen.getByText("Main Corpus:Exploration Activity 1,Lexical Bundles Activity 1")).toBeTruthy();
    expect(activitiesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        corpusName: "Main Corpus",
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

    render(<ActivitiesView />);

    fireEvent.click(screen.getByRole("button", { name: "Start Lexical Bundles" }));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      projectId: "project-1",
      activityType: "lb_activities",
    });

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith({
        type: "open-analysis",
        projectId: "project-1",
        activityId: "activity-2",
        activityType: "lb_activities",
      });
    });
  });
});
