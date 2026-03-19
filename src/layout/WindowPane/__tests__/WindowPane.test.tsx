import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WindowPane from "../../WindowPane";

const useModalControlMock = vi.fn();
const headerMock = vi.fn();
const sidebarMock = vi.fn();
const mainViewMock = vi.fn();
const chatInterfaceMock = vi.fn();

vi.mock("../useModalControl", () => ({
  useModalControl: () => useModalControlMock(),
}));

vi.mock("../../Header", () => ({
  default: (props: { onOpenModal: () => void }) => {
    headerMock(props);
    return <div data-testid="header" />;
  },
}));

vi.mock("../../Sidebar", () => ({
  default: (props: { onOpenModal: () => void }) => {
    sidebarMock(props);
    return <div data-testid="sidebar" />;
  },
}));

vi.mock("../../MainView", () => ({
  default: (props: { modalIsOpen: boolean; onOpenModal: () => void; onCloseModal: () => void; route: "home" | "settings" }) => {
    mainViewMock(props);
    return <div data-testid="main-view" />;
  },
}));

vi.mock("../../ChatInterface", () => ({
  default: () => {
    chatInterfaceMock();
    return <div data-testid="chat-interface" />;
  },
}));

describe("WindowPane", () => {
  const openModal = vi.fn();
  const closeModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useModalControlMock.mockReturnValue({
      modalIsOpen: true,
      openModal,
      closeModal,
    });
  });

  it("renders the shell components", () => {
    render(<WindowPane />);

    expect(screen.getByTestId("header")).toBeTruthy();
    expect(screen.getByTestId("sidebar")).toBeTruthy();
    expect(screen.getByTestId("main-view")).toBeTruthy();
    expect(screen.getByTestId("chat-interface")).toBeTruthy();
  });

  it("passes the modal control handlers into the shell children", () => {
    render(<WindowPane />);

    expect(headerMock).toHaveBeenCalledWith(expect.objectContaining({ onOpenModal: openModal }));
    expect(sidebarMock).toHaveBeenCalledWith(expect.objectContaining({ onOpenModal: openModal }));
    expect(mainViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        modalIsOpen: true,
        onOpenModal: openModal,
        onCloseModal: closeModal,
        route: "home",
      }),
    );
    expect(chatInterfaceMock).toHaveBeenCalled();
  });
});
