import { beforeEach, describe, expect, it, vi } from "vitest";

import { projectProgressEventsAdapter } from "../projects.adapters.events";

describe("projectProgressEventsAdapter", () => {
  const onProjectCreationProgress = vi.fn();
  const onProjectCorpusMetadataProgress = vi.fn();

  beforeEach(() => {
    onProjectCreationProgress.mockReset();
    vi.stubGlobal("window", {
      api: {
        invoke: vi.fn(),
        onProjectCreationProgress,
        onProjectCorpusMetadataProgress,
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

  it("registers a corpus metadata listener and forwards mapped events", () => {
    const listener = vi.fn();
    const unsubscribe = vi.fn();
    let registeredListener: ((payload: {
      requestId: string;
      projectUuid: string;
      correlationId: string;
      stage: string;
      message: string;
      percent?: number;
    }) => void) | undefined;

    onProjectCorpusMetadataProgress.mockImplementation((callback) => {
      registeredListener = callback;
      return unsubscribe;
    });

    const returnedUnsubscribe = projectProgressEventsAdapter.subscribeToProjectCorpusMetadataProgress(listener);

    expect(onProjectCorpusMetadataProgress).toHaveBeenCalledTimes(1);
    expect(returnedUnsubscribe).toBe(unsubscribe);

    registeredListener?.({
      requestId: "req-meta-1",
      projectUuid: "11111111-1111-1111-1111-111111111111",
      correlationId: "cid-meta-1",
      stage: "native_progress",
      message: "Loading corpus hierarchy",
      percent: 15,
    });

    expect(listener).toHaveBeenCalledWith({
      requestId: "req-meta-1",
      projectUuid: "11111111-1111-1111-1111-111111111111",
      correlationId: "cid-meta-1",
      stage: "native_progress",
      message: "Loading corpus hierarchy",
      percent: 15,
    });
  });
});
