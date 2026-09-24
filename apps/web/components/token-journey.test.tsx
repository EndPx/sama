// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { TokenJourney } from "./token-journey";

describe("stakeholder token journey", () => {
  it("shows every custody transition in order without hidden panels", () => {
    render(<TokenJourney />);

    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(4);
    expect(within(steps[0]).getByText("Bids")).toBeTruthy();
    expect(within(steps[0]).getByText("One result")).toBeTruthy();
    expect(within(steps[1]).getByText("Winner's wallet")).toBeTruthy();
    expect(within(steps[2]).getByText("Marketplace escrow")).toBeTruthy();
    expect(within(steps[3]).getByText("Buyer's wallet")).toBeTruthy();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText(/KIRA/)).toBeNull();
  });
});
