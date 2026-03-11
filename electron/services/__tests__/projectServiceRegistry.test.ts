import { describe, expect, it } from "vitest";
import { projectServiceRegistry } from "../projectServiceRegistry";

describe("projectServiceRegistry", () => {
  it("registers, retrieves, checks, and removes create-project operations", () => {
    const requestId = "req-registry-basic";
    const operation = {
      requestId,
      outputDir: "/tmp/corpus-a",
      cancel: () => {},
    };

    projectServiceRegistry.removeCreateProjectOperation(requestId);

    expect(projectServiceRegistry.hasCreateProjectOperation(requestId)).toBe(false);

    projectServiceRegistry.registerCreateProjectOperation(operation);

    expect(projectServiceRegistry.hasCreateProjectOperation(requestId)).toBe(true);
    expect(projectServiceRegistry.getCreateProjectOperation(requestId)).toBe(operation);

    projectServiceRegistry.removeCreateProjectOperation(requestId);

    expect(projectServiceRegistry.hasCreateProjectOperation(requestId)).toBe(false);
    expect(projectServiceRegistry.getCreateProjectOperation(requestId)).toBeUndefined();
  });

  it("replaces an existing operation when the same request id is registered again", () => {
    const requestId = "req-registry-replace";
    const first = {
      requestId,
      outputDir: "/tmp/corpus-first",
      cancel: () => {},
    };
    const second = {
      requestId,
      outputDir: "/tmp/corpus-second",
      cancel: () => {},
    };

    projectServiceRegistry.removeCreateProjectOperation(requestId);

    projectServiceRegistry.registerCreateProjectOperation(first);
    projectServiceRegistry.registerCreateProjectOperation(second);

    expect(projectServiceRegistry.getCreateProjectOperation(requestId)).toBe(second);

    projectServiceRegistry.removeCreateProjectOperation(requestId);
  });
});
