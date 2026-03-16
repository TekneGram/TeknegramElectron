import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";

const mutationState = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  error: null as Error | null,
}));

vi.mock("../hooks/useDeleteProjectMutation", () => ({
  useDeleteProjectMutation: () => mutationState,
}));

import { useDeleteProjectFlow } from "../hooks/useDeleteProjectFlow";

describe("useDeleteProjectFlow", () => {
  let queryClient: QueryClient;
  const createInvalidateQueriesSpy = () =>
    vi.fn(async () => undefined);
  let invalidateQueriesSpy: ReturnType<typeof createInvalidateQueriesSpy>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mutationState.error = null;
    mutationState.mutateAsync.mockReset();
    mutationState.reset.mockReset();
    queryClient = new QueryClient();
    invalidateQueriesSpy = createInvalidateQueriesSpy();
    queryClient.invalidateQueries = invalidateQueriesSpy;
  });

  function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  it("opens, cancels, confirms, and invalidates after the success window and collapse", async () => {
    mutationState.mutateAsync.mockResolvedValue({
      projectUuid: "11111111-1111-1111-1111-111111111111",
      deletedBinaryFilesPath: "/tmp/corpus-a",
    });

    const { result } = renderHook(
      () => useDeleteProjectFlow({ projectUuid: "11111111-1111-1111-1111-111111111111" }),
      { wrapper }
    );

    act(() => {
      result.current.openConfirmation();
    });

    expect(result.current.isConfirming).toBe(true);

    act(() => {
      result.current.cancelConfirmation();
    });

    expect(result.current.phase).toBe("idle");

    act(() => {
      result.current.openConfirmation();
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(mutationState.mutateAsync).toHaveBeenCalledWith({
      projectUuid: "11111111-1111-1111-1111-111111111111",
    });
    expect(result.current.isConfirmed).toBe(true);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(result.current.isCollapsing).toBe(true);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(520);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["projects"] });
  });

  it("returns to confirming when deletion fails", async () => {
    const failure = new Error("Delete failed");
    mutationState.error = failure;
    mutationState.mutateAsync.mockRejectedValue(failure);

    const { result } = renderHook(
      () => useDeleteProjectFlow({ projectUuid: "11111111-1111-1111-1111-111111111111" }),
      { wrapper }
    );

    act(() => {
      result.current.openConfirmation();
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.phase).toBe("confirming");
    expect(result.current.error).toBe(failure);
  });
});
