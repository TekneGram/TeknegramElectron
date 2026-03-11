import { beforeEach, describe, expect, it, vi } from "vitest";

import { projectProgressEventsAdapter } from "../projects.adapters.events";

describe("projectProgressEventsAdapter", () => {
  const onProjectCreationProgress = vi.fn();

  beforeEach(() => {
    onProjectCreationProgress.mockReset();
    vi.stubGlobal("window", {
      api: {
        invoke: vi.fn(),
        onProjectCreationProgress,
      },
    });
  });

  it("registers a progress listener and forwards mapped events", () => {
    const listener = vi.fn();
    const unsubscribe = vi.fn();
    let registeredListener: ((payload: {
      requestId: string;
      correlationId: string;
      message: string;
      percent: number;
    }) => void) | undefined;

    onProjectCreationProgress.mockImplementation((callback) => {
      registeredListener = callback;
      return unsubscribe;
    });

    const returnedUnsubscribe = projectProgressEventsAdapter.subscribeToProjectCreationProgress(listener);

    expect(onProjectCreationProgress).toHaveBeenCalledTimes(1);
    expect(returnedUnsubscribe).toBe(unsubscribe);

    registeredListener?.({
      requestId: "req-1",
      correlationId: "cid-1",
      message: "Processing corpus",
      percent: 42,
    });

    expect(listener).toHaveBeenCalledWith({
      requestId: "req-1",
      correlationId: "cid-1",
      message: "Processing corpus",
      percent: 42,
    });
  });
});
