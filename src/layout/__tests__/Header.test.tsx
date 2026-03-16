import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "../Header";

const projectsTinyViewMock = vi.fn();
const themeToggleMock = vi.fn();
const navigationPaneMock = vi.fn();

vi.mock("@/features/ProjectsTinyView/ProjectsTinyView", () => ({
  default: (props: { onOpenModal: () => void }) => {
    projectsTinyViewMock(props);
    return <div data-testid="projects-tiny-view" />;
  },
}));

vi.mock("@/features/ThemeToggle/ThemeToggle", () => ({
  default: () => {
    themeToggleMock();
    return <div data-testid="theme-toggle" />;
  },
}));

vi.mock("../Header/NavigationPane", () => ({
  default: (props: {
    currentRoute: "auto" | "projects" | "settings";
    hasProjects: boolean;
    onNavigateProjects: () => void;
    onNavigateSettings: () => void;
  }) => {
    navigationPaneMock(props);
    return <div data-testid="navigation-pane" />;
  },
}));

describe("Header", () => {
  const onOpenModal = vi.fn();
  const onNavigateProjects = vi.fn();
  const onNavigateSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header feature components and forwards the open handler", () => {
    render(
      <Header
        onOpenModal={onOpenModal}
        currentRoute="settings"
        hasProjects
        onNavigateProjects={onNavigateProjects}
        onNavigateSettings={onNavigateSettings}
      />,
    );

    expect(screen.getByTestId("projects-tiny-view")).toBeTruthy();
    expect(screen.getByTestId("navigation-pane")).toBeTruthy();
    expect(screen.getByTestId("theme-toggle")).toBeTruthy();
    expect(projectsTinyViewMock).toHaveBeenCalledWith(expect.objectContaining({ onOpenModal }));
    expect(themeToggleMock).toHaveBeenCalled();
    expect(navigationPaneMock).toHaveBeenCalledWith(expect.objectContaining({
      currentRoute: "settings",
      hasProjects: true,
      onNavigateProjects,
      onNavigateSettings,
    }));
  });
});
