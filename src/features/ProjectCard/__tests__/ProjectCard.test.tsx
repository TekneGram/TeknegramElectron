import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const renameFlowState = vi.hoisted(() => ({
  error: null as Error | null,
  isEditing: false,
  isSaving: false,
  draftName: "BAWE",
  canConfirm: false,
  startEditing: vi.fn(),
  cancelEditing: vi.fn(),
  setDraftName: vi.fn(),
  confirmEditing: vi.fn(),
}));

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

const corpusMetadataState = vi.hoisted(() => ({
  summary: "This corpus has 2766 documents, 116223 lemmas, 125083 types and 6505803 words.",
  source: "cache" as "cache" | "generated" | "fallback" | undefined,
  isLoading: false,
  isError: false,
  error: null as Error | null,
  progressMessage: "Preparing corpus metadata summary...",
  progressStage: "idle",
  percent: undefined as number | undefined,
}));

vi.mock("../hooks/useDeleteProjectFlow", () => ({
  useDeleteProjectFlow: () => flowState,
}));

vi.mock("../hooks/useProjectNameEditFlow", () => ({
  useProjectNameEditFlow: () => renameFlowState,
}));

vi.mock("../hooks/useProjectCorpusMetadata", () => ({
  useProjectCorpusMetadata: () => corpusMetadataState,
}));

import ProjectCard from "../ProjectCard";

describe("ProjectCard", () => {
  const onNavigateToActivities = vi.fn();
  const project = {
    uuid: "11111111-1111-1111-1111-111111111111",
    projectName: "BAWE",
    createdAt: "2026-03-11T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    onNavigateToActivities.mockReset();
    flowState.error = null;
    flowState.isConfirming = false;
    flowState.isDeleting = false;
    flowState.isConfirmed = false;
    flowState.isCollapsing = false;
    renameFlowState.error = null;
    renameFlowState.isEditing = false;
    renameFlowState.isSaving = false;
    renameFlowState.draftName = "BAWE";
    renameFlowState.canConfirm = false;
    corpusMetadataState.summary = "This corpus has 2766 documents, 116223 lemmas, 125083 types and 6505803 words.";
    corpusMetadataState.source = "cache";
    corpusMetadataState.isLoading = false;
    corpusMetadataState.isError = false;
    corpusMetadataState.error = null;
    corpusMetadataState.progressMessage = "Preparing corpus metadata summary...";
    corpusMetadataState.progressStage = "idle";
    corpusMetadataState.percent = undefined;
  });

  it("renders the delete button and enter button", () => {
    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    expect(screen.getByRole("heading", { name: "BAWE" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Enter Project" })).toBeTruthy();
    expect(screen.getByText("This corpus has 2766 documents, 116223 lemmas, 125083 types and 6505803 words.")).toBeTruthy();
  });

  it("shows inline corpus metadata progress while loading", () => {
    corpusMetadataState.isLoading = true;
    corpusMetadataState.progressMessage = "Computing corpus metadata.";
    corpusMetadataState.percent = 42;

    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    expect(screen.getByText("Computing corpus metadata.")).toBeTruthy();
    expect(screen.getByText("42%")).toBeTruthy();
  });

  it("starts editing when the project title is clicked", () => {
    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    fireEvent.click(screen.getByRole("button", { name: "BAWE" }));

    expect(renameFlowState.startEditing).toHaveBeenCalledTimes(1);
  });

  it("renders inline edit controls with svg icon buttons while editing", () => {
    renameFlowState.isEditing = true;
    renameFlowState.draftName = "Edited BAWE";
    renameFlowState.canConfirm = true;

    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    expect(screen.getByRole("textbox", { name: "Edit project name for BAWE" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel project name edit" }).querySelector("svg")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm project name edit" }).querySelector("svg")).toBeTruthy();
  });

  it("opens the confirmation modal when delete is clicked", () => {
    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(flowState.openConfirmation).toHaveBeenCalledTimes(1);
  });

  it("renders cancel and confirm actions while confirming", () => {
    flowState.isConfirming = true;

    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
  });

  it("replaces the buttons with deleting status while the request is pending", () => {
    flowState.isConfirming = true;
    flowState.isDeleting = true;

    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    expect(screen.getByText("Deleting...")).toBeTruthy();
    expect(screen.getByText("Deleting...").closest(".project-card-status-block")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Confirm" })).toBeNull();
  });

  it("shows delete confirmed after a successful delete", () => {
    flowState.isConfirming = true;
    flowState.isConfirmed = true;

    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    expect(screen.getByText("Delete confirmed")).toBeTruthy();
  });

  it("calls the activities navigation callback with the project id", () => {
    render(<ProjectCard project={project} onNavigateToActivities={onNavigateToActivities} />);

    fireEvent.click(screen.getByRole("button", { name: "Enter Project" }));

    expect(onNavigateToActivities).toHaveBeenCalledWith(project.uuid, project.projectName);
  });
});
