import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectsTinyView from "../ProjectsTinyView";

const useListProjectsQueryMock = vi.fn();

vi.mock("../hooks/useProjectsQuery", () => ({
  useListProjectsQuery: () => useListProjectsQueryMock(),
}));

describe("ProjectsTinyView", () => {
  const onOpenModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    useListProjectsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<ProjectsTinyView onOpenModal={onOpenModal} />);

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("renders error state", () => {
    useListProjectsQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<ProjectsTinyView onOpenModal={onOpenModal} />);

    expect(screen.getByText("Hmm...")).toBeTruthy();
  });

  it("renders the new project button when there are no projects and opens the modal on click", async () => {
    const user = userEvent.setup();
    useListProjectsQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<ProjectsTinyView onOpenModal={onOpenModal} />);

    await user.click(screen.getByRole("button", { name: "+ New Project" }));

    expect(onOpenModal).toHaveBeenCalled();
  });

  it("renders a project select when project data exists", () => {
    useListProjectsQueryMock.mockReturnValue({
      data: [
        {
          uuid: "project-1",
          projectName: "BAWE",
          createdAt: "2026-03-11T00:00:00.000Z",
        },
        {
          uuid: "project-2",
          projectName: "BNC",
          createdAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<ProjectsTinyView onOpenModal={onOpenModal} />);

    expect(screen.getByLabelText("Select a project")).toBeTruthy();
    expect(screen.getByRole("option", { name: "Projects" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "BAWE" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "BNC" })).toBeTruthy();
  });

  it("updates the selected value when the user chooses a project", async () => {
    const user = userEvent.setup();
    useListProjectsQueryMock.mockReturnValue({
      data: [
        {
          uuid: "project-1",
          projectName: "BAWE",
          createdAt: "2026-03-11T00:00:00.000Z",
        },
        {
          uuid: "project-2",
          projectName: "BNC",
          createdAt: "2026-03-10T00:00:00.000Z",
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<ProjectsTinyView onOpenModal={onOpenModal} />);

    const select = screen.getByLabelText("Select a project") as HTMLSelectElement;
    await user.selectOptions(select, "project-2");

    expect(select.value).toBe("project-2");
  });
});
