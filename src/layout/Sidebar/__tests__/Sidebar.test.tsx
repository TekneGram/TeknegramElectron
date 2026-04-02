import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Sidebar from "../../Sidebar";

const createProjectButtonMock = vi.fn();

vi.mock("../buttons/CreateProjectButton", () => ({
  default: (props: { onClickCreate: () => void }) => {
    createProjectButtonMock(props);
    return <button data-testid="create-project-button" onClick={props.onClickCreate}>New Project</button>;
  },
}));

vi.mock("../ControlPanel", () => ({
  default: () => <div data-testid="control-panel" />,
}));

describe("Sidebar", () => {
  const onOpenModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the create project button and forwards the click handler", () => {
    render(<Sidebar onOpenModal={onOpenModal} />);

    expect(screen.getByTestId("create-project-button")).toBeTruthy();
    expect(createProjectButtonMock).toHaveBeenCalledWith(
      expect.objectContaining({ onClickCreate: onOpenModal }),
    );
  });
});
