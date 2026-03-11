import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggle from "../ThemeToggle";

const useThemeContextMock = vi.fn();

vi.mock("@/app/providers/useTheme", () => ({
  useThemeContext: () => useThemeContextMock(),
}));

describe("ThemeToggle", () => {
  const setTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the toggle button with the moon icon when the resolved theme is light", () => {
    useThemeContextMock.mockReturnValue({
      resolvedTheme: "light",
      setTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "theme-toggle" });

    expect(button).toBeTruthy();
    expect(button.querySelector("circle")).toBeNull();
  });

  it("renders the toggle button with the sun icon when the resolved theme is dark", () => {
    useThemeContextMock.mockReturnValue({
      resolvedTheme: "dark",
      setTheme,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "theme-toggle" });

    expect(button).toBeTruthy();
    expect(button.querySelector("circle")).toBeTruthy();
  });

  it("sets the theme to dark when clicked from light mode", async () => {
    const user = userEvent.setup();
    useThemeContextMock.mockReturnValue({
      resolvedTheme: "light",
      setTheme,
    });

    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "theme-toggle" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("sets the theme to light when clicked from dark mode", async () => {
    const user = userEvent.setup();
    useThemeContextMock.mockReturnValue({
      resolvedTheme: "dark",
      setTheme,
    });

    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "theme-toggle" }));

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
