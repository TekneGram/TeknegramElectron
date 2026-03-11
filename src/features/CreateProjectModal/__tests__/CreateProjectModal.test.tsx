import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateProjectModal from "../CreateProjectModal";

const useCreateProjectFlowMock = vi.fn();
const usePickCorpusFolderMock = vi.fn();
const usePickSemanticsRulesFileMock = vi.fn();

vi.mock("../hooks/useCreateProjectFlow", () => ({
  default: () => useCreateProjectFlowMock(),
}));

vi.mock("../hooks/usePickCorpusFolder", () => ({
  default: () => usePickCorpusFolderMock(),
}));

vi.mock("../hooks/usePickSemanticsRulesFile", () => ({
  default: () => usePickSemanticsRulesFileMock(),
}));

describe("CreateProjectModal", () => {
  const submitCreateProject = vi.fn();
  const cancelCreateProject = vi.fn();
  const pickFolder = vi.fn();
  const pickSemanticsRules = vi.fn();
  const onClose = vi.fn();
  const onSuccessfulCreation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useCreateProjectFlowMock.mockReturnValue({
      submitCreateProject,
      cancelCreateProject,
      wasCancelled: false,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
      progressMessage: "Preparing project creation...",
      percent: 0,
    });

    usePickCorpusFolderMock.mockReturnValue({
      pickFolder,
      isPicking: false,
      setIsPicking: vi.fn(),
    });

    usePickSemanticsRulesFileMock.mockReturnValue({
      pickSemanticsRules,
      isPickingSemanticsRules: false,
      setIsPickingSemanticsRules: vi.fn(),
    });
  });

  it("submits trimmed form values", async () => {
    const user = userEvent.setup();

    render(<CreateProjectModal onClose={onClose} onSuccessfulCreation={onSuccessfulCreation} />);

    await user.type(screen.getByLabelText("Project Name"), "  Project  ");
    await user.type(screen.getByLabelText("Corpus Name"), "  Corpus  ");

    fireEvent.drop(screen.getByText("Drop corpus folder here").closest(".corpus-folder-dropzone")!, {
      dataTransfer: {
        files: [{ path: "  /tmp/corpus  " }],
      },
    });

    fireEvent.drop(screen.getByText("Drop semantics rules file here").closest(".semantics-rules-dropzone")!, {
      dataTransfer: {
        files: [{ path: "  /tmp/rules.tsv  " }],
      },
    });

    await user.click(screen.getByRole("button", { name: "create project" }));

    expect(submitCreateProject).toHaveBeenCalledWith({
      projectName: "Project",
      corpusName: "Corpus",
      folderPath: "/tmp/corpus",
      semanticsRulesPath: "/tmp/rules.tsv",
    });
  });

  it("closes and resets on successful creation", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CreateProjectModal onClose={onClose} onSuccessfulCreation={onSuccessfulCreation} />
    );

    await user.type(screen.getByLabelText("Project Name"), "Project");
    await user.type(screen.getByLabelText("Corpus Name"), "Corpus");

    useCreateProjectFlowMock.mockReturnValue({
      submitCreateProject,
      cancelCreateProject,
      wasCancelled: false,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
      progressMessage: "Preparing project creation...",
      percent: 0,
    });

    rerender(<CreateProjectModal onClose={onClose} onSuccessfulCreation={onSuccessfulCreation} />);

    await waitFor(() => {
      expect(onSuccessfulCreation).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    expect((screen.getByLabelText("Project Name") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Corpus Name") as HTMLInputElement).value).toBe("");
  });

  it("renders an error message when the flow reports an error", async () => {
    useCreateProjectFlowMock.mockReturnValue({
      submitCreateProject,
      cancelCreateProject,
      wasCancelled: false,
      isPending: false,
      isSuccess: false,
      isError: true,
      error: new Error("Something broke"),
      progressMessage: "Preparing project creation...",
      percent: 0,
    });

    render(<CreateProjectModal onClose={onClose} onSuccessfulCreation={onSuccessfulCreation} />);

    expect(
      screen.getByText("There was an error creating the project: Something broke")
    ).toBeTruthy();
  });

  it("suppresses the error message when the flow was cancelled", () => {
    useCreateProjectFlowMock.mockReturnValue({
      submitCreateProject,
      cancelCreateProject,
      wasCancelled: true,
      isPending: false,
      isSuccess: false,
      isError: true,
      error: new Error("Cancelled"),
      progressMessage: "Preparing project creation...",
      percent: 0,
    });

    render(<CreateProjectModal onClose={onClose} onSuccessfulCreation={onSuccessfulCreation} />);

    expect(screen.queryByText(/There was an error creating the project:/)).toBeNull();
  });

  it("shows the processing overlay and calls cancel while pending", async () => {
    const user = userEvent.setup();
    useCreateProjectFlowMock.mockReturnValue({
      submitCreateProject,
      cancelCreateProject,
      wasCancelled: false,
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
      progressMessage: "Halfway there",
      percent: 50,
    });

    render(<CreateProjectModal onClose={onClose} onSuccessfulCreation={onSuccessfulCreation} />);

    expect(screen.getByText("Building Corpus")).toBeTruthy();
    expect(screen.getByText("Halfway there")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancelCreateProject).toHaveBeenCalled();
  });
});
