import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MainView from "../../MainView";

const useListProjectsQueryMock = vi.fn();
const createProjectModalMock = vi.fn();
const projectsListMock = vi.fn();
const createSuccessTransitionMock = vi.fn();
let currentQueryState: {
  data: Array<{ uuid: string; projectName: string; createdAt: string }> | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: ReturnType<typeof vi.fn>;
};

vi.mock("@/features/ProjectsTinyView/hooks/useProjectsQuery", () => ({
  useListProjectsQuery: () => useListProjectsQueryMock(),
}));

vi.mock("@/features/CreateProjectModal/CreateProjectModal", () => ({
  default: (props: { onClose: () => void; onSuccessfulCreation: () => void }) => {
    createProjectModalMock(props);

    return (
      <div data-testid="create-project-modal">
        <button onClick={props.onSuccessfulCreation}>complete project creation</button>
        <button onClick={props.onClose}>close modal</button>
      </div>
    );
  },
}));

vi.mock("../ProjectsList", () => ({
  default: (props: { projectsData: Array<{ uuid: string; projectName: string }> }) => {
    projectsListMock(props);

    return <div data-testid="projects-list">{props.projectsData.map((project) => project.projectName).join(", ")}</div>;
  },
}));

vi.mock("../CreateSuccessTransition", () => ({
  default: () => {
    createSuccessTransitionMock();
    return <div data-testid="create-success-transition">Project Created</div>;
  },
}));

describe("MainView", () => {
  const onOpenModal = vi.fn();
  const onCloseModal = vi.fn();
  const refetch = vi.fn();

  function setQueryState(overrides: Partial<typeof currentQueryState>) {
    currentQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
      refetch,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    setQueryState({});
    useListProjectsQueryMock.mockImplementation(() => currentQueryState);
  });

  it("renders loading state", () => {
    setQueryState({
      isLoading: true,
    });

    render(<MainView modalIsOpen={false} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByText("Loading!")).toBeTruthy();
  });

  it("renders error state", () => {
    setQueryState({
      isError: true,
    });

    render(<MainView modalIsOpen={false} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByText("Something went badly wrong!")).toBeTruthy();
  });

  it("renders the welcome screen when no projects exist", () => {
    setQueryState({
      data: [],
    });

    render(<MainView modalIsOpen={false} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByText("Teknegram")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start New Project" })).toBeTruthy();
    expect(screen.queryByTestId("projects-list")).toBeNull();
  });

  it("renders the modal over the welcome screen when requested", () => {
    setQueryState({
      data: [],
    });

    render(<MainView modalIsOpen={true} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByTestId("create-project-modal")).toBeTruthy();
    expect(createProjectModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onClose: onCloseModal,
        onSuccessfulCreation: expect.any(Function),
      }),
    );
  });

  it("renders the projects list when projects exist", async () => {
    setQueryState({
      data: [
        { uuid: "project-1", projectName: "BAWE", createdAt: "2026-03-11T00:00:00.000Z" },
      ],
    });

    render(<MainView modalIsOpen={false} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    await waitFor(() => {
      expect(screen.getByTestId("projects-list")).toBeTruthy();
    });

    expect(projectsListMock).toHaveBeenCalledWith(
      expect.objectContaining({
        projectsData: [
          { uuid: "project-1", projectName: "BAWE", createdAt: "2026-03-11T00:00:00.000Z" },
        ],
      }),
    );
  });

  it("shows the success transition immediately after project creation, then lands on the projects list", async () => {
    vi.useFakeTimers();
    refetch.mockImplementation(async () => {
      currentQueryState = {
        ...currentQueryState,
        data: [
          { uuid: "project-2", projectName: "BNC", createdAt: "2026-03-10T00:00:00.000Z" },
        ],
      };

      return { data: currentQueryState.data };
    });

    setQueryState({
      data: [],
    });

    render(<MainView modalIsOpen={true} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    fireEvent.click(screen.getByRole("button", { name: "complete project creation" }));

    expect(screen.getByTestId("create-success-transition")).toBeTruthy();
    expect(refetch).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3999);
    });

    expect(screen.getByTestId("create-success-transition")).toBeTruthy();
    expect(refetch).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(refetch).toHaveBeenCalled();
    expect(screen.getByTestId("projects-list")).toBeTruthy();
  });

  it("returns to the welcome screen after the transition when the refetch still finds no projects", async () => {
    vi.useFakeTimers();
    refetch.mockImplementation(async () => {
      currentQueryState = {
        ...currentQueryState,
        data: [],
      };

      return { data: [] };
    });

    setQueryState({
      data: [],
    });

    render(<MainView modalIsOpen={true} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    fireEvent.click(screen.getByRole("button", { name: "complete project creation" }));

    expect(screen.getByTestId("create-success-transition")).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    expect(refetch).toHaveBeenCalled();
    expect(screen.getByText("Teknegram")).toBeTruthy();
  });
});
