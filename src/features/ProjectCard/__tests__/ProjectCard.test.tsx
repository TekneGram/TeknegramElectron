import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const flowState = vi.hoisted(() => ({
  error: null as Error | null,
  isConfirming: false,
  isDeleting: false,
  isConfirmed: false,
  isCollapsing: false,
  openConfirmation: vi.fn(),
  cancelConfirmation: vi.fn(),
  confirmDelete: vi.fn(),
}));

vi.mock("../hooks/useDeleteProjectFlow", () => ({
  useDeleteProjectFlow: () => flowState,
}));

import ProjectCard from "../ProjectCard";

describe("ProjectCard", () => {
  const project = {
    uuid: "11111111-1111-1111-1111-111111111111",
    projectName: "BAWE",
    createdAt: "2026-03-11T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    flowState.error = null;
    flowState.isConfirming = false;
    flowState.isDeleting = false;
    flowState.isConfirmed = false;
    flowState.isCollapsing = false;
  });

  it("renders the delete button and enter button", () => {
    render(<ProjectCard project={project} />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Enter Project" })).toBeTruthy();
  });

  it("opens the confirmation modal when delete is clicked", () => {
    render(<ProjectCard project={project} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(flowState.openConfirmation).toHaveBeenCalledTimes(1);
  });

  it("renders cancel and confirm actions while confirming", () => {
    flowState.isConfirming = true;

    render(<ProjectCard project={project} />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
  });

  it("replaces the buttons with deleting status while the request is pending", () => {
    flowState.isConfirming = true;
    flowState.isDeleting = true;

    render(<ProjectCard project={project} />);

    expect(screen.getByText("Deleting...")).toBeTruthy();
    expect(screen.getByText("Deleting...").closest(".project-card-status-block")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Confirm" })).toBeNull();
  });

  it("shows delete confirmed after a successful delete", () => {
    flowState.isConfirming = true;
    flowState.isConfirmed = true;

    render(<ProjectCard project={project} />);

    expect(screen.getByText("Delete confirmed")).toBeTruthy();
  });
});
