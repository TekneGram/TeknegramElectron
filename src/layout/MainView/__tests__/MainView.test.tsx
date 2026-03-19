import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MainView from "../../MainView";

const createProjectModalMock = vi.fn();
const homeViewMock = vi.fn();
const settingsViewMock = vi.fn();
const activitiesViewMock = vi.fn();
const useNavigationMock = vi.fn();

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

vi.mock("@/app/providers/useNavigation", () => ({
  useNavigation: () => useNavigationMock(),
}));

vi.mock("../HomeView", () => ({
  default: (props: { onOpenModal: () => void; projectCreationCount: number }) => {
    homeViewMock(props);
    return <div data-testid="home-view" />;
  },
}));

vi.mock("../SettingsView", () => ({
  default: () => {
    settingsViewMock();
    return <div data-testid="settings-view" />;
  },
}));

vi.mock("../ActivitiesView", () => ({
  default: () => {
    activitiesViewMock();
    return <div data-testid="activities-view" />;
  },
}));

describe("MainView", () => {
  const onOpenModal = vi.fn();
  const onCloseModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigationMock.mockReturnValue({
      navigationState: { kind: "home" },
    });
  });

  it("renders the home view for the home route", () => {
    render(<MainView modalIsOpen={false} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByTestId("home-view")).toBeTruthy();
    expect(homeViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onOpenModal,
        projectCreationCount: 0,
      }),
    );
  });

  it("renders the settings view for the settings route", () => {
    useNavigationMock.mockReturnValue({
      navigationState: { kind: "settings" },
    });

    render(<MainView modalIsOpen={false} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByTestId("settings-view")).toBeTruthy();
    expect(settingsViewMock).toHaveBeenCalled();
    expect(screen.queryByTestId("home-view")).toBeNull();
  });

  it("renders the activities view for the activities route", () => {
    useNavigationMock.mockReturnValue({
      navigationState: { kind: "activities", projectId: "project-1" },
    });

    render(<MainView modalIsOpen={false} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByTestId("activities-view")).toBeTruthy();
    expect(activitiesViewMock).toHaveBeenCalled();
    expect(screen.queryByTestId("home-view")).toBeNull();
  });

  it("renders the modal when requested", () => {
    render(<MainView modalIsOpen={true} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByTestId("create-project-modal")).toBeTruthy();
    expect(createProjectModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        onClose: onCloseModal,
        onSuccessfulCreation: expect.any(Function),
      }),
    );
  });

  it("renders the modal over the settings route as well", () => {
    useNavigationMock.mockReturnValue({
      navigationState: { kind: "settings" },
    });

    render(<MainView modalIsOpen={true} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    expect(screen.getByTestId("settings-view")).toBeTruthy();
    expect(screen.getByTestId("create-project-modal")).toBeTruthy();
  });

  it("increments the home project creation signal when the modal reports success", () => {
    render(<MainView modalIsOpen={true} onOpenModal={onOpenModal} onCloseModal={onCloseModal} />);

    fireEvent.click(screen.getByRole("button", { name: "complete project creation" }));

    expect(homeViewMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        onOpenModal,
        projectCreationCount: 1,
      }),
    );
  });
});
