import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ActivitiesStartTransition from "../ActivitiesStartTransition";

describe("ActivitiesStartTransition", () => {
  it("renders vocabulary transition copy", () => {
    render(<ActivitiesStartTransition activityType="vocab_activities" />);

    expect(screen.getByText("Vocabulary activity created.")).toBeTruthy();
    expect(screen.getByText("Preparing vocabulary workspace...")).toBeTruthy();
  });

  it("renders lexical bundles transition copy", () => {
    render(<ActivitiesStartTransition activityType="lb_activities" />);

    expect(screen.getByText("Lexical bundles activity created.")).toBeTruthy();
    expect(screen.getByText("Preparing lexical bundles workspace...")).toBeTruthy();
  });

  it("renders collocation transition copy", () => {
    render(<ActivitiesStartTransition activityType="collocation_activities" />);

    expect(screen.getByText("Collocation activity created.")).toBeTruthy();
    expect(screen.getByText("Preparing collocation workspace...")).toBeTruthy();
  });

  it("renders dependency transition copy", () => {
    render(<ActivitiesStartTransition activityType="dependency_activities" />);

    expect(screen.getByText("Dependency activity created.")).toBeTruthy();
    expect(screen.getByText("Preparing dependency workspace...")).toBeTruthy();
  });
});
