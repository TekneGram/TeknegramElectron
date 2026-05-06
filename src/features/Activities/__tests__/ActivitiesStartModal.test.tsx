import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActivitiesStartModal from "../ActivitiesStartModal";

describe("ActivitiesStartModal", () => {
  it("renders lexical bundles copy and confirm action", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ActivitiesStartModal
        isOpen={true}
        pendingActivityType="lb_activities"
        projectName="Corpus Project"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Start lexical bundles activity?")).toBeTruthy();
    expect(screen.getByText("Create a new lexical bundles activity for Corpus Project.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Start Lexical Bundles" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders vocabulary copy and allows cancellation from the backdrop", () => {
    const onCancel = vi.fn();

    const { container } = render(
      <ActivitiesStartModal
        isOpen={true}
        pendingActivityType="vocab_activities"
        projectName="Corpus Project"
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("Start vocabulary activity?")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start Vocabulary" })).toBeTruthy();

    const backdrop = container.querySelector(".activities-start-modal-backdrop");

    if (!backdrop) {
      throw new Error("expected modal backdrop");
    }

    fireEvent.click(backdrop);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables modal actions while submitting", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ActivitiesStartModal
        isOpen={true}
        pendingActivityType="lb_activities"
        projectName="Corpus Project"
        isSubmitting={true}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Creating..." }).hasAttribute("disabled")).toBe(true);
  });

  it("renders collocation copy and confirm action", () => {
    render(
      <ActivitiesStartModal
        isOpen={true}
        pendingActivityType="collocation_activities"
        projectName="Corpus Project"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("Start collocation activity?")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start Collocation" })).toBeTruthy();
  });

  it("renders dependency copy and confirm action", () => {
    render(
      <ActivitiesStartModal
        isOpen={true}
        pendingActivityType="dependency_activities"
        projectName="Corpus Project"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("Start dependency activity?")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start Dependency" })).toBeTruthy();
  });
});
