import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../ThemeProvider";
import { useThemeContext } from "../useTheme";

type MatchMediaController = {
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchChange: (matches: boolean) => void;
};

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
  };
}

function installMatchMedia(matches: boolean): MatchMediaController {
  let changeListener: ((event: MediaQueryListEvent) => void) | null = null;

  const mediaQuery = {
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: vi.fn((event: string, listener: EventListenerOrEventListenerObject) => {
      if (event === "change") {
        changeListener = listener as (event: MediaQueryListEvent) => void;
      }
    }),
    removeEventListener: vi.fn((event: string, listener: EventListenerOrEventListenerObject) => {
      if (event === "change" && changeListener === listener) {
        changeListener = null;
      }
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } satisfies Partial<MediaQueryList>;

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(() => mediaQuery),
  });

  return {
    addEventListener: mediaQuery.addEventListener,
    removeEventListener: mediaQuery.removeEventListener,
    dispatchChange(nextMatches: boolean) {
      mediaQuery.matches = nextMatches;
      changeListener?.({ matches: nextMatches } as MediaQueryListEvent);
    },
  };
}

describe("ThemeProvider", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  });

  it("starts with system preference and resolves from the current system theme", async () => {
    installMatchMedia(true);

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.themePreference).toBe("system");
      expect(result.current.resolvedTheme).toBe("dark");
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  it("falls back to light when matchMedia is unavailable", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.themePreference).toBe("system");
      expect(result.current.resolvedTheme).toBe("light");
      expect(document.documentElement.dataset.theme).toBe("light");
      expect(document.documentElement.style.colorScheme).toBe("light");
    });
  });

  it("updates the resolved theme and root element when the system theme changes in system mode", async () => {
    const matchMedia = installMatchMedia(false);

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe("light");
    });

    act(() => {
      matchMedia.dispatchChange(true);
    });

    await waitFor(() => {
      expect(result.current.themePreference).toBe("system");
      expect(result.current.resolvedTheme).toBe("dark");
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  it("ignores system theme changes after an explicit theme is selected", async () => {
    const matchMedia = installMatchMedia(false);

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setTheme("dark");
    });

    await waitFor(() => {
      expect(result.current.themePreference).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
    });

    act(() => {
      matchMedia.dispatchChange(false);
    });

    await waitFor(() => {
      expect(result.current.themePreference).toBe("dark");
      expect(result.current.resolvedTheme).toBe("dark");
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  it("subscribes to and unsubscribes from media query changes", () => {
    const matchMedia = installMatchMedia(true);

    const { unmount } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    expect(matchMedia.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    const handler = matchMedia.addEventListener.mock.calls[0]?.[1];

    unmount();

    expect(matchMedia.removeEventListener).toHaveBeenCalledWith("change", handler);
  });
});
