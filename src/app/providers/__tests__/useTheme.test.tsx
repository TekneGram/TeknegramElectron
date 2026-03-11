import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "../ThemeProvider";
import { useThemeContext } from "../useTheme";

function Wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("useThemeContext", () => {
  it("throws when used outside ThemeProvider", () => {
    expect(() => renderHook(() => useThemeContext())).toThrow(
      "useThemeContext must be used within a ThemeProvider",
    );
  });

  it("returns the theme context inside ThemeProvider", () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: Wrapper,
    });

    expect(result.current.themePreference).toBe("system");
    expect(result.current.resolvedTheme).toBe("light");
    expect(result.current.setTheme).toBeTypeOf("function");
  });
});
