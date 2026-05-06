import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivitiesView from "../ActivitiesView";

const activitiesMock = vi.fn();
const activitiesWelcomeMock = vi.fn();
const activitiesStartTransitionMock = vi.fn();
const navigationMock = vi.fn();
const useActivitiesQueryMock = vi.fn();
const useActivityStartMock = vi.fn();

vi.mock("@/app/providers/useNavigation", () => ({
  useNavigation: () => navigationMock(),
}));

vi.mock("@/app/providers/useActivityStart", () => ({
  useActivityStart: () => useActivityStartMock(),
}));

vi.mock("@/features/Activities/hooks/useActivitiesQuery", () => ({
  useActivitiesQuery: (...args: unknown[]) => useActivitiesQueryMock(...args),
}));

vi.mock("@/features/Activities/Activities", () => ({
  default: (props: { activities: Array<{ activityName: string }>; activityParentContext: { corpusName: string } }) => {
    activitiesMock(props);
    return <div data-testid="activities-list">{props.activityParentContext.corpusName}:{props.activities.map((activity) => activity.activityName).join(",")}</div>;
  },
}));

vi.mock("@/features/Activities/ActivitiesWelcome", () => ({
  default: (props: { projectName: string; projectId: string }) => {
    activitiesWelcomeMock(props);
    return <div data-testid="activities-welcome">{props.projectName}:{props.projectId}</div>;
  },
}));

vi.mock("@/features/Activities/ActivitiesStartTransition", () => ({
  default: (props: { activityType: string | null }) => {
    activitiesStartTransitionMock(props);
    return <div data-testid="activities-start-transition">{props.activityType}</div>;
  },
}));

describe("ActivitiesView", () => {
  const refetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    navigationMock.mockReturnValue({
      navigationState: {
        kind: "activities",
        projectId: "project-1",
        projectName: "Corpus Project",
      },
    });
    useActivityStartMock.mockReturnValue({
      state: {
        phase: "idle",
        transitionActivityType: null,
      },
    });
    useActivitiesQueryMock.mockReturnValue({
      data: {
        corpusId: "corpus-1",
        projectId: "project-1",
        corpusName: "Main Corpus",
        binaryFilesPath: "/tmp/corpus/bin",
        activities: [],
      },
      isLoading: false,
      isError: false,
      refetch: refetchMock,
    });
  });

  it("returns null when the current route is not the activities view", () => {
    navigationMock.mockReturnValue({
      navigationState: { kind: "home" },
    });

    const { container } = render(<ActivitiesView />);

    expect(container.innerHTML).toBe("");
    expect(useActivitiesQueryMock).toHaveBeenCalledWith({ projectId: "" });
  });

  it("renders the empty state when no activities exist", () => {
    render(<ActivitiesView />);

    expect(screen.getByTestId("activities-welcome").textContent).toBe("Corpus Project:project-1");
    expect(activitiesWelcomeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectName: "Corpus Project",
        projectId: "project-1",
      }),
    );
  });

  it("renders the populated state with corpus name and cards", () => {
    useActivitiesQueryMock.mockReturnValue({
      data: {
        corpusId: "corpus-1",
        projectId: "project-1",
        corpusName: "Main Corpus",
        binaryFilesPath: "/tmp/corpus/bin",
        activities: [
          {
            activityId: "activity-1",
            activityName: "Vocabulary Activity 1",
            activityType: "vocab_activities",
            activityTypeDisplayName: "Vocabulary Activity",
            description: "Explores vocabulary patterns and lexical usage in the corpus.",
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
      refetch: refetchMock,
    });

    render(<ActivitiesView />);

    expect(screen.getByTestId("activities-list").textContent).toBe(
      "Main Corpus:Vocabulary Activity 1,Lexical Bundles Activity 1",
    );
    expect(activitiesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        activityParentContext: expect.objectContaining({
          corpusName: "Main Corpus",
        }),
      }),
    );
  });

  it("renders the loading transition while data is being fetched", () => {
    useActivitiesQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: refetchMock,
    });

    render(<ActivitiesView />);

    expect(screen.getByText("Loading activities.")).toBeTruthy();
    expect(screen.getByText("Gathering activity data...")).toBeTruthy();
  });

  it("renders the transition screen while an activity is being prepared", () => {
    useActivityStartMock.mockReturnValue({
      state: {
        phase: "transitioning",
        transitionActivityType: "lb_activities",
      },
    });

    render(<ActivitiesView />);

    expect(screen.getByTestId("activities-start-transition").textContent).toBe("lb_activities");
    expect(activitiesStartTransitionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        activityType: "lb_activities",
      }),
    );
  });

  it("renders an error state and retries when refetch is requested", () => {
    useActivitiesQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    });

    render(<ActivitiesView />);

    expect(screen.getByText("Teknegram could not load the activities for this project right now.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
