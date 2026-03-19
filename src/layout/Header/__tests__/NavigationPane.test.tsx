import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NavigationPane from "../NavigationPane";

const dispatchMock = vi.fn();
const useNavigationMock = vi.fn();

vi.mock("@/app/providers/useNavigation", () => ({
  useNavigation: () => useNavigationMock(),
}));

describe("NavigationPane", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigationMock.mockReturnValue({
      navigationState: { kind: "home" },
      dispatch: dispatchMock,
    });
  });

  it("marks the current route as active", () => {
    render(<NavigationPane />);

    expect(screen.getByRole("button", { name: "Show home view" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Show settings view" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("dispatches settings navigation when the settings button is clicked", () => {
    render(<NavigationPane />);

    fireEvent.click(screen.getByRole("button", { name: "Show settings view" }));

    expect(dispatchMock).toHaveBeenCalledWith({ type: "go-settings" });
  });

  it("dispatches home navigation when the home button is clicked", () => {
    useNavigationMock.mockReturnValue({
      navigationState: { kind: "settings" },
      dispatch: dispatchMock,
    });

    render(<NavigationPane />);

    fireEvent.click(screen.getByRole("button", { name: "Show home view" }));

    expect(dispatchMock).toHaveBeenCalledWith({ type: "go-home" });
  });
});
