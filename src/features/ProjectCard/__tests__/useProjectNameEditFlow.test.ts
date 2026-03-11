import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";

const mutationState = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  error: null as Error | null,
  isPending: false,
}));

vi.mock("../hooks/useRenameProjectMutation", () => ({
  useRenameProjectMutation: () => mutationState,
}));

import { useProjectNameEditFlow } from "../hooks/useProjectNameEditFlow";

describe("useProjectNameEditFlow", () => {
  let queryClient: QueryClient;
  let invalidateQueriesSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationState.error = null;
    mutationState.isPending = false;
    mutationState.mutateAsync.mockReset();
    mutationState.reset.mockReset();
    queryClient = new QueryClient();
    queryClient.setQueryData(["projects"], [
      {
        uuid: "11111111-1111-1111-1111-111111111111",
        projectName: "BAWE",
        createdAt: "2026-03-11T00:00:00.000Z",
      },
    ]);
    invalidateQueriesSpy = vi.fn(async () => undefined);
    queryClient.invalidateQueries = invalidateQueriesSpy;
  });

  function wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  it("opens editing, tracks draft state, confirms, updates cache, and closes the editor", async () => {
    mutationState.mutateAsync.mockResolvedValue({
      projectUuid: "11111111-1111-1111-1111-111111111111",
      projectName: "Updated BAWE",
    });

    const { result } = renderHook(
      () => useProjectNameEditFlow({
        projectUuid: "11111111-1111-1111-1111-111111111111",
        projectName: "BAWE",
      }),
      { wrapper }
    );

    act(() => {
      result.current.startEditing();
    });

    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.setDraftName("Updated BAWE");
    });

    expect(result.current.canConfirm).toBe(true);

    await act(async () => {
      await result.current.confirmEditing();
    });

    expect(mutationState.mutateAsync).toHaveBeenCalledWith({
      projectUuid: "11111111-1111-1111-1111-111111111111",
      projectName: "Updated BAWE",
    });
    expect(queryClient.getQueryData(["projects"])).toEqual([
      {
        uuid: "11111111-1111-1111-1111-111111111111",
        projectName: "Updated BAWE",
        createdAt: "2026-03-11T00:00:00.000Z",
      },
    ]);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ["projects"] });
    expect(result.current.isEditing).toBe(false);
  });

  it("keeps confirm disabled when the draft is unchanged or blank", () => {
    const { result } = renderHook(
      () => useProjectNameEditFlow({
        projectUuid: "11111111-1111-1111-1111-111111111111",
        projectName: "BAWE",
      }),
      { wrapper }
    );

    act(() => {
      result.current.startEditing();
      result.current.setDraftName("   ");
    });

    expect(result.current.canConfirm).toBe(false);

    act(() => {
      result.current.setDraftName("BAWE");
    });

    expect(result.current.canConfirm).toBe(false);
  });

  it("cancels editing and resets the draft to the current project name", () => {
    const { result } = renderHook(
      () => useProjectNameEditFlow({
        projectUuid: "11111111-1111-1111-1111-111111111111",
        projectName: "BAWE",
      }),
      { wrapper }
    );

    act(() => {
      result.current.startEditing();
      result.current.setDraftName("Updated BAWE");
      result.current.cancelEditing();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.draftName).toBe("BAWE");
    expect(mutationState.reset).toHaveBeenCalledTimes(2);
  });
});
