// @vitest-environment jsdom
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TokenJourney } from "./token-journey";

describe("KIRA journey", () => {
  it("reveals the correct custody explanation at every step", async () => {
    const user = userEvent.setup();
    render(<TokenJourney />);

    expect(screen.getByText("The result comes first.")).toBeTruthy();
    expect(screen.getByText("Claimable allocation")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: /winner claims/i }));
    expect(screen.getByText("A winner claims KIRA once.")).toBeTruthy();
    expect(screen.getByText("Eligible wallet")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: /holder lists/i }));
    expect(screen.getByText("A listing puts KIRA in escrow.")).toBeTruthy();
    expect(screen.getByText("Marketplace escrow")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: /buyer receives/i }));
    expect(
      screen.getByText("A purchase moves both sides together."),
    ).toBeTruthy();
    expect(screen.getByText("Eligible buyer")).toBeTruthy();
  });
});
