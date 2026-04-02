import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ActivitiesStartTransition from "../ActivitiesStartTransition";

describe("ActivitiesStartTransition", () => {
  it("renders exploration transition copy", () => {
    render(<ActivitiesStartTransition activityType="explore_activities" />);

    expect(screen.getByText("Exploration activity created.")).toBeTruthy();
    expect(screen.getByText("Preparing exploration workspace...")).toBeTruthy();
  });

  it("renders lexical bundles transition copy", () => {
    render(<ActivitiesStartTransition activityType="lb_activities" />);

    expect(screen.getByText("Lexical bundles activity created")).toBeTruthy();
    expect(screen.getByText("Prepareing lexical bundles workspace...")).toBeTruthy();
  });
});
