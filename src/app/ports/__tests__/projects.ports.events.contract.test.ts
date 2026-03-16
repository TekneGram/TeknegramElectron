import { describe, expectTypeOf, it } from "vitest";
import type {
  ProjectCreationProgress,
  ProjectCorpusMetadataProgress,
  ProjectProgressEventsPort,
  Unsubscribe,
} from "../projects.ports.events";

describe("project progress event port contracts", () => {
  it("accepts the expected event payload shape", () => {
    const event: ProjectCreationProgress = {
      requestId: "req-1",
      correlationId: "cid-1",
      message: "Building corpus",
      percent: 42,
    };

    expectTypeOf(event).toEqualTypeOf<ProjectCreationProgress>();
  });

  it("accepts the expected corpus metadata event payload shape", () => {
    const event: ProjectCorpusMetadataProgress = {
      requestId: "req-meta-1",
      projectUuid: "11111111-1111-1111-1111-111111111111",
      correlationId: "cid-1",
      stage: "native_progress",
      message: "Loading corpus hierarchy",
      percent: 42,
    };

    expectTypeOf(event).toEqualTypeOf<ProjectCorpusMetadataProgress>();
  });

  it("requires a listener-based subscription that returns an unsubscribe function", () => {
    const port: ProjectProgressEventsPort = {
      subscribeToProjectCreationProgress(listener) {
        listener({
          requestId: "req-1",
          correlationId: "cid-1",
          message: "Building corpus",
          percent: 42,
        });

        return () => {};
      },
      subscribeToProjectCorpusMetadataProgress(listener) {
        listener({
          requestId: "req-meta-1",
          projectUuid: "11111111-1111-1111-1111-111111111111",
          correlationId: "cid-meta-1",
          stage: "native_progress",
          message: "Loading corpus hierarchy",
          percent: 12,
        });

        return () => {};
      },
    };

    const unsubscribe = port.subscribeToProjectCreationProgress((event) => {
      expectTypeOf(event).toEqualTypeOf<ProjectCreationProgress>();
    });
    const metadataUnsubscribe = port.subscribeToProjectCorpusMetadataProgress((event) => {
      expectTypeOf(event).toEqualTypeOf<ProjectCorpusMetadataProgress>();
    });

    expectTypeOf(unsubscribe).toEqualTypeOf<Unsubscribe>();
    expectTypeOf(metadataUnsubscribe).toEqualTypeOf<Unsubscribe>();
  });

  it("rejects malformed progress events", () => {
    const invalidEvent: ProjectCreationProgress = {
      requestId: "req-1",
      correlationId: "cid-1",
      message: "Building corpus",
      // @ts-expect-error percent must be a number
      percent: "42",
    };

    expectTypeOf(invalidEvent).toEqualTypeOf<ProjectCreationProgress>();
  });
});
