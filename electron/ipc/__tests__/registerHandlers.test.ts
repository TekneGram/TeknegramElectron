import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  registerProjectHandlersMock,
  registerActivityHandlersMock,
  registerSettingsHandlersMock,
  registerSystemHandlersMock,
} = vi.hoisted(() => ({
  registerProjectHandlersMock: vi.fn(),
  registerActivityHandlersMock: vi.fn(),
  registerSettingsHandlersMock: vi.fn(),
  registerSystemHandlersMock: vi.fn(),
}));

vi.mock("../registerHandlers/register.projects", () => ({
  RegisterProjectHandlers: registerProjectHandlersMock,
}));

vi.mock("../registerHandlers/register.activities", () => ({
  RegisterActivityHandlers: registerActivityHandlersMock,
}));

vi.mock("../registerHandlers/register.settings", () => ({
  registerSettingsHandlers: registerSettingsHandlersMock,
}));

vi.mock("../registerHandlers/register.system", () => ({
  RegisterSystemHandlers: registerSystemHandlersMock,
}));

import { registerHandlers } from "../registerHandlers";

describe("registerHandlers", () => {
  beforeEach(() => {
    registerProjectHandlersMock.mockReset();
    registerActivityHandlersMock.mockReset();
    registerSettingsHandlersMock.mockReset();
    registerSystemHandlersMock.mockReset();
  });

  it("composes project, activity, settings, and system registration modules once", () => {
    registerHandlers();

    expect(registerProjectHandlersMock).toHaveBeenCalledTimes(1);
    expect(registerActivityHandlersMock).toHaveBeenCalledTimes(1);
    expect(registerSettingsHandlersMock).toHaveBeenCalledTimes(1);
    expect(registerSystemHandlersMock).toHaveBeenCalledTimes(1);
  });
});
