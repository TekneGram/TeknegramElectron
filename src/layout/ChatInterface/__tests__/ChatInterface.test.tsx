import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChatInterface from "../../ChatInterface";

const chatInputMock = vi.fn();

vi.mock("../ChatInput", () => ({
  default: () => {
    chatInputMock();
    return <div data-testid="chat-input" />;
  },
}));

describe("ChatInterface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the chat input inside the shell", () => {
    render(<ChatInterface />);

    expect(screen.getByTestId("chat-input")).toBeTruthy();
    expect(chatInputMock).toHaveBeenCalled();
  });
});
