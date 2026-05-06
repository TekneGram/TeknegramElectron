import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActivityStartProvider } from "../ActivityStartProvider";
import { useActivityStart } from "../useActivityStart";

const dispatchMock = vi.fn();
const useNavigationMock = vi.fn();
const useCreateActivityMutationMock = vi.fn();

vi.mock("../useNavigation", () => ({
  useNavigation: () => useNavigationMock(),
}));

vi.mock("@/features/Activities/hooks/useCreateActivityMutation", () => ({
  useCreateActivityMutation: () => useCreateActivityMutationMock(),
}));

function ActivityStartHarness() {
  const { state, openStartModal, closeStartModal, confirmStartActivity } = useActivityStart();

  return (
    <div>
      <div data-testid="phase">{state.phase}</div>
      <div data-testid="pending-type">{state.pendingActivityType ?? "none"}</div>
      <div data-testid="transition-type">{state.transitionActivityType ?? "none"}</div>
      <button
        onClick={() =>
          openStartModal({
            projectId: "project-1",
            projectName: "Corpus Project",
            activityType: "lb_activities",
          })
        }
      >
        open lexical
      </button>
      <button onClick={closeStartModal}>close</button>
      <button onClick={() => void confirmStartActivity()}>confirm</button>
    </div>
  );
}

describe("ActivityStartProvider", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useNavigationMock.mockReturnValue({
      navigationState: {
        kind: "activities",
        projectId: "project-1",
        projectName: "Corpus Project",
      },
      dispatch: dispatchMock,
    });
    useCreateActivityMutationMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens and closes the start modal state", () => {
    render(
      <ActivityStartProvider>
        <ActivityStartHarness />
      </ActivityStartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "open lexical" }));

    expect(screen.getByTestId("phase").textContent).toBe("confirming");
    expect(screen.getByTestId("pending-type").textContent).toBe("lb_activities");

    fireEvent.click(screen.getByRole("button", { name: "close" }));

    expect(screen.getByTestId("phase").textContent).toBe("idle");
    expect(screen.getByTestId("pending-type").textContent).toBe("none");
  });

  it("creates an activity, shows the transition state, and navigates after the delay", async () => {
    mutateAsyncMock.mockResolvedValue({
      projectId: "project-1",
      corpusId: "corpus-1",
      corpusName: "Corpus Project",
      binaryFilesPath: "/tmp/corpus/bin",
      activities: [
        {
          activityId: "activity-9",
          activityName: "Lexical Bundles Activity 1",
          activityType: "lb_activities",
          activityTypeDisplayName: "Lexical Bundles Activity",
          description: "Samples corpora, extracts lexical bundles and analyzes them.",
        },
      ],
    });

    render(
      <ActivityStartProvider>
        <ActivityStartHarness />
      </ActivityStartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "open lexical" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      projectId: "project-1",
      activityType: "lb_activities",
    });
    expect(screen.getByTestId("phase").textContent).toBe("transitioning");
    expect(screen.getByTestId("transition-type").textContent).toBe("lb_activities");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: "open-analysis",
      activityDetails: {
        activityId: "activity-9",
        activityName: "Lexical Bundles Activity 1",
        activityType: "lb_activities",
        activityTypeDisplayName: "Lexical Bundles Activity",
        description: "Samples corpora, extracts lexical bundles and analyzes them.",
      },
      activityParentContext: {
        corpusId: "corpus-1",
        projectId: "project-1",
        corpusName: "Corpus Project",
        binaryFilesPath: "/tmp/corpus/bin",
      },
    });
    expect(screen.getByTestId("phase").textContent).toBe("idle");
  });

  it("returns to the confirming state when creation fails", async () => {
    mutateAsyncMock.mockRejectedValue(new Error("creation failed"));

    render(
      <ActivityStartProvider>
        <ActivityStartHarness />
      </ActivityStartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "open lexical" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    });

    expect(screen.getByTestId("phase").textContent).toBe("confirming");
    expect(screen.getByTestId("pending-type").textContent).toBe("lb_activities");
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it("ignores close requests while creating", async () => {
    let resolveMutation: ((value: {
      projectId: string;
      corpusId: string;
      corpusName: string;
      binaryFilesPath: string;
      activities: Array<{
        activityId: string;
        activityName: string;
        activityType: "lb_activities";
        activityTypeDisplayName: string;
        description: string;
      }>;
    }) => void) | undefined;

    mutateAsyncMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMutation = resolve;
        }),
    );

    render(
      <ActivityStartProvider>
        <ActivityStartHarness />
      </ActivityStartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "open lexical" }));

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    });

    expect(screen.getByTestId("phase").textContent).toBe("creating");

    fireEvent.click(screen.getByRole("button", { name: "close" }));

    expect(screen.getByTestId("phase").textContent).toBe("creating");

    await act(async () => {
      resolveMutation?.({
        projectId: "project-1",
        corpusId: "corpus-1",
        corpusName: "Corpus Project",
        binaryFilesPath: "/tmp/corpus/bin",
        activities: [
          {
            activityId: "activity-9",
            activityName: "Lexical Bundles Activity 1",
            activityType: "lb_activities",
            activityTypeDisplayName: "Lexical Bundles Activity",
            description: "Samples corpora, extracts lexical bundles and analyzes them.",
          },
        ],
      });
    });
  });

  it("clears the delayed navigation timer on unmount", async () => {
    mutateAsyncMock.mockResolvedValue({
      projectId: "project-1",
      corpusId: "corpus-1",
      corpusName: "Corpus Project",
      binaryFilesPath: "/tmp/corpus/bin",
      activities: [
        {
          activityId: "activity-9",
          activityName: "Lexical Bundles Activity 1",
          activityType: "lb_activities",
          activityTypeDisplayName: "Lexical Bundles Activity",
          description: "Samples corpora, extracts lexical bundles and analyzes them.",
        },
      ],
    });

    const { unmount } = render(
      <ActivityStartProvider>
        <ActivityStartHarness />
      </ActivityStartProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "open lexical" }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    });

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(dispatchMock).not.toHaveBeenCalled();
  });
});
