import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "../Header";

const projectsTinyViewMock = vi.fn();
const themeToggleMock = vi.fn();

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

describe("Header", () => {
  const onOpenModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header feature components and forwards the open handler", () => {
    render(<Header onOpenModal={onOpenModal} />);

    expect(screen.getByTestId("projects-tiny-view")).toBeTruthy();
    expect(screen.getByTestId("theme-toggle")).toBeTruthy();
    expect(projectsTinyViewMock).toHaveBeenCalledWith(expect.objectContaining({ onOpenModal }));
    expect(themeToggleMock).toHaveBeenCalled();
  });
});
