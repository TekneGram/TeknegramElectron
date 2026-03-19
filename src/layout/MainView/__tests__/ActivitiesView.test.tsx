import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ActivitiesView from "../ActivitiesView";

describe("ActivitiesView", () => {
  it("renders the empty-state activities cards and start buttons", () => {
    render(<ActivitiesView />);

    expect(screen.getByText("Explore Activities")).toBeTruthy();
    expect(screen.getByText("Lexical Bundles")).toBeTruthy();
    expect(screen.getByText("Explore and analyze your corpus in depth with these activities")).toBeTruthy();
    expect(screen.getByText("Use scientific computing techniques to extract lexical bundles from your corpus")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start Explore Activity" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start Lexical Bundles Activity" })).toBeTruthy();
  });
});
