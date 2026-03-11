import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FrontAppError } from "@/app/errors/FrontAppError";
import useCreateProjectFlow from "../hooks/useCreateProjectFlow";

const {
  mockMutation,
  subscribeToProjectCreationProgress,
  submitCancelCreateProject,
  successToast,
} = vi.hoisted(() => ({
  mockMutation: {
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null as Error | null,
  },
  subscribeToProjectCreationProgress: vi.fn(),
  submitCancelCreateProject: vi.fn(),
  successToast: vi.fn(),
}));

vi.mock("../hooks/useCreateProjectMutation", () => ({
  default: () => mockMutation,
}));

vi.mock("@/app/adapters/projects.adapters.events", () => ({
  projectProgressEventsAdapter: {
    subscribeToProjectCreationProgress,
  },
}));

vi.mock("../services/cancelProjectModal.service", () => ({
  submitCancelCreateProject,
}));

vi.mock("@/app/adapters/projects.adapters", () => ({
  projectsAdapter: {},
}));

vi.mock("@/app/adapters/notifications", () => ({
  toastifyNotifier: {
    success: successToast,
  },
}));

describe("useCreateProjectFlow", () => {
  const mockRequestId = "11111111-1111-1111-1111-111111111111";
  let progressListener: ((event: { requestId: string; message: string; percent: number }) => void) | undefined;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();

    mockMutation.mutateAsync.mockReset();
    mockMutation.reset.mockReset();
    mockMutation.isPending = false;
    mockMutation.isSuccess = false;
    mockMutation.isError = false;
    mockMutation.error = null;

    progressListener = undefined;
    subscribeToProjectCreationProgress.mockImplementation((listener) => {
      progressListener = listener;
      return vi.fn();
    });

    submitCancelCreateProject.mockResolvedValue({
      requestId: "req-1",
      message: "Cancellation requested",
    });

    successToast.mockReset();
  });

  it("starts with the default progress state", () => {
    const { result } = renderHook(() => useCreateProjectFlow());

    expect(result.current.progressMessage).toBe("Preparing project creation...");
    expect(result.current.percent).toBe(0);
    expect(result.current.wasCancelled).toBe(false);
    expect(result.current.cancellationRequested).toBe(false);
  });

  it("submits the request with a generated requestId and resets cancellation state", async () => {
    const uuidSpy = vi.spyOn(crypto, "randomUUID").mockReturnValue(mockRequestId);
    mockMutation.mutateAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCreateProjectFlow());

    await act(async () => {
      await result.current.submitCreateProject({
        projectName: "Project",
        corpusName: "Corpus",
        folderPath: "/tmp/corpus",
        semanticsRulesPath: "/tmp/rules.tsv",
      });
    });

    expect(uuidSpy).toHaveBeenCalled();
    expect(mockMutation.reset).toHaveBeenCalled();
    expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
      requestId: mockRequestId,
      projectName: "Project",
      corpusName: "Corpus",
      folderPath: "/tmp/corpus",
      semanticsRulesPath: "/tmp/rules.tsv",
    });
    expect(result.current.cancellationRequested).toBe(false);
    expect(result.current.wasCancelled).toBe(false);
  });

  it("updates progress only for the active request id", async () => {
    let release!: () => void;
    mockMutation.mutateAsync.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        })
    );

    const uuidSpy = vi.spyOn(crypto, "randomUUID").mockReturnValue(mockRequestId);
    const { result } = renderHook(() => useCreateProjectFlow());

    await act(async () => {
      void result.current.submitCreateProject({
        projectName: "Project",
        corpusName: "Corpus",
        folderPath: "/tmp/corpus",
      });
    });

    act(() => {
      progressListener?.({
        requestId: "other-req",
        message: "Ignore me",
        percent: 99,
      });
    });

    expect(result.current.progressMessage).toBe("Preparing corpus build...");
    expect(result.current.percent).toBe(0);

    act(() => {
      progressListener?.({
        requestId: mockRequestId,
        message: "Halfway there",
        percent: 50,
      });
    });

    expect(result.current.progressMessage).toBe("Halfway there");
    expect(result.current.percent).toBe(50);

    await act(async () => {
      release();
    });

    uuidSpy.mockRestore();
  });

  it("cancelCreateProject does nothing when there is no active request", async () => {
    const { result } = renderHook(() => useCreateProjectFlow());

    await act(async () => {
      await result.current.cancelCreateProject();
    });

    expect(submitCancelCreateProject).not.toHaveBeenCalled();
  });

  it("cancelCreateProject sets cancellation state and calls the cancel service with the active request id", async () => {
    let release!: () => void;
    mockMutation.mutateAsync.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        })
    );
    vi.spyOn(crypto, "randomUUID").mockReturnValue(mockRequestId);

    const { result } = renderHook(() => useCreateProjectFlow());

    await act(async () => {
      void result.current.submitCreateProject({
        projectName: "Project",
        corpusName: "Corpus",
        folderPath: "/tmp/corpus",
      });
    });

    await act(async () => {
      await result.current.cancelCreateProject();
    });

    expect(result.current.cancellationRequested).toBe(true);
    expect(result.current.progressMessage).toBe("Cancelling project creation...");
    expect(submitCancelCreateProject).toHaveBeenCalledWith({}, { requestId: mockRequestId });

    await act(async () => {
      release();
    });
  });

  it("suppresses a cancelled create error after cancellation was requested", async () => {
    const cancelledError = new FrontAppError({
      kind: "cancelled",
      userMessage: "Cancelled",
      debugId: "cid-1",
    });

    let rejectCreate!: (error: unknown) => void;
    mockMutation.mutateAsync.mockImplementation(
      () =>
        new Promise<void>((_, reject) => {
          rejectCreate = reject;
        })
    );
    vi.spyOn(crypto, "randomUUID").mockReturnValue(mockRequestId);

    const { result } = renderHook(() => useCreateProjectFlow());

    await act(async () => {
      void result.current.submitCreateProject({
        projectName: "Project",
        corpusName: "Corpus",
        folderPath: "/tmp/corpus",
      });
    });

    await act(async () => {
      await result.current.cancelCreateProject();
    });

    await act(async () => {
      rejectCreate(cancelledError);
    });

    await waitFor(() => {
      expect(result.current.wasCancelled).toBe(true);
    });

    expect(result.current.cancellationRequested).toBe(false);
    expect(result.current.progressMessage).toBe("Preparing project creation...");
    expect(result.current.percent).toBe(0);
    expect(successToast).toHaveBeenCalledWith("Project creation cancelled", {
      id: "create-project-cancelled",
    });
  });

  it("rethrows non-cancel errors", async () => {
    const boom = new Error("Boom");
    mockMutation.mutateAsync.mockRejectedValue(boom);
    vi.spyOn(crypto, "randomUUID").mockReturnValue(mockRequestId);

    const { result } = renderHook(() => useCreateProjectFlow());

    await expect(
      act(async () => {
        await result.current.submitCreateProject({
          projectName: "Project",
          corpusName: "Corpus",
          folderPath: "/tmp/corpus",
        });
      })
    ).rejects.toThrow("Boom");
  });
});
