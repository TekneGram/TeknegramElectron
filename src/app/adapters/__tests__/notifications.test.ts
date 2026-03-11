import { beforeEach, describe, expect, it, vi } from "vitest";

const { errorMock, successMock } = vi.hoisted(() => ({
  errorMock: vi.fn(),
  successMock: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: {
    error: errorMock,
    success: successMock,
  },
}));

import { toastifyNotifier } from "../notifications";

describe("toastifyNotifier", () => {
  beforeEach(() => {
    errorMock.mockReset();
    successMock.mockReset();
  });

  it("forwards error notifications to react-toastify", () => {
    toastifyNotifier.error("Failed");

    expect(errorMock).toHaveBeenCalledWith("Failed", { toastId: undefined });
  });

  it("passes error ids through as toastId", () => {
    toastifyNotifier.error("Failed", { id: "toast-1" });

    expect(errorMock).toHaveBeenCalledWith("Failed", { toastId: "toast-1" });
  });

  it("forwards success notifications to react-toastify", () => {
    toastifyNotifier.success("Done");

    expect(successMock).toHaveBeenCalledWith("Done", { toastId: undefined });
  });

  it("passes success ids through as toastId", () => {
    toastifyNotifier.success("Done", { id: "toast-2" });

    expect(successMock).toHaveBeenCalledWith("Done", { toastId: "toast-2" });
  });
});
