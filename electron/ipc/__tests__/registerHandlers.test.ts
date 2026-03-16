import { beforeEach, describe, expect, it, vi } from "vitest";

const { registerProjectHandlersMock, registerSystemHandlersMock } = vi.hoisted(() => ({
  registerProjectHandlersMock: vi.fn(),
  registerSystemHandlersMock: vi.fn(),
}));

vi.mock("../registerHandlers/register.projects", () => ({
  RegisterProjectHandlers: registerProjectHandlersMock,
}));

vi.mock("../registerHandlers/register.system", () => ({
  RegisterSystemHandlers: registerSystemHandlersMock,
}));

import { registerHandlers } from "../registerHandlers";

describe("registerHandlers", () => {
  beforeEach(() => {
    registerProjectHandlersMock.mockReset();
    registerSystemHandlersMock.mockReset();
  });

  it("composes project and system registration modules once", () => {
    registerHandlers();

    expect(registerProjectHandlersMock).toHaveBeenCalledTimes(1);
    expect(registerSystemHandlersMock).toHaveBeenCalledTimes(1);
  });
});
