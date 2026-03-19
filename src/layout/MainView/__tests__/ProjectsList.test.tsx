import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectsList from "../ProjectsList";

const projectCardMock = vi.fn();
const dispatchMock = vi.fn();
const useNavigationMock = vi.fn();

vi.mock("@/app/providers/useNavigation", () => ({
  useNavigation: () => useNavigationMock(),
}));

vi.mock("@/features/ProjectCard/ProjectCard", () => ({
  default: (props: {
    project: { uuid: string; projectName: string };
    onNavigateToActivities: (projectId: string) => void;
  }) => {
    projectCardMock(props);

    return (
      <button onClick={() => props.onNavigateToActivities(props.project.uuid)}>
        Enter {props.project.projectName}
      </button>
    );
  },
}));

describe("ProjectsList", () => {
  const projectsData = [
    { uuid: "project-1", projectName: "BAWE", createdAt: "2026-03-11T00:00:00.000Z" },
    { uuid: "project-2", projectName: "BNC", createdAt: "2026-03-10T00:00:00.000Z" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigationMock.mockReturnValue({
      dispatch: dispatchMock,
    });
  });

  it("renders a project card for each project", () => {
    render(<ProjectsList projectsData={projectsData} />);

    expect(screen.getByText("Corpus Projects")).toBeTruthy();
    expect(projectCardMock).toHaveBeenCalledTimes(2);
  });

  it("dispatches activities navigation when a project card enters a project", () => {
    render(<ProjectsList projectsData={projectsData} />);

    fireEvent.click(screen.getByRole("button", { name: "Enter BAWE" }));

    expect(dispatchMock).toHaveBeenCalledWith({
      type: "enter-activities",
      projectId: "project-1",
    });
  });
});
