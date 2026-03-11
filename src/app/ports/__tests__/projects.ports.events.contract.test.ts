import { describe, expectTypeOf, it } from "vitest";
import type {
  ProjectCreationProgress,
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
    };

    const unsubscribe = port.subscribeToProjectCreationProgress((event) => {
      expectTypeOf(event).toEqualTypeOf<ProjectCreationProgress>();
    });

    expectTypeOf(unsubscribe).toEqualTypeOf<Unsubscribe>();
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
