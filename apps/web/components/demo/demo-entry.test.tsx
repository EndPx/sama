// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

vi.mock("@/lib/config", () => ({
  docsUrl: "https://docs.example.test/",
}));

import { DemoEntry } from "./demo-entry";

afterEach(cleanup);

describe("mock-only demo workspace", () => {
  it("opens without login, wallet state, or transaction actions", () => {
    render(<DemoEntry />);

    expect(
      screen.getByRole("heading", {
        name: "A clearer way to join a public round.",
      }),
    ).toBeTruthy();
    expect(screen.getAllByText("Sample data").length).toBeGreaterThan(0);
    expect(screen.getByText("Example profile")).toBeTruthy();
    expect(screen.getByText("Fixed example, not live activity")).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: /sign in|connect wallet|buy|claim/i,
      }),
    ).toBeNull();
  });

  it("explains exact accepted and refundable values for a selected reference bid", () => {
    render(<DemoEntry />);

    const detail = screen.getByRole("complementary", {
      name: "Selected reference bid",
    });
    expect(within(detail).getByText("30,000 demoUSDC")).toBeTruthy();
    expect(within(detail).getByText("120,000 demoUSDC")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Bid A/i }));
    expect(
      within(detail).getByText("Accepted").parentElement?.textContent,
    ).toContain("0 demoUSDC");
    expect(
      within(detail).getByText("Refundable").parentElement?.textContent,
    ).toContain("100,000 demoUSDC");
  });

  it("shows the locked round terms and explores its mock lifecycle", () => {
    render(<DemoEntry />);

    fireEvent.click(screen.getByRole("button", { name: "Explore the round" }));
    const terms = screen.getByRole("region", { name: "Reference offer terms" });
    expect(within(terms).getByText("10%")).toBeTruthy();
    expect(within(terms).getByText("4M to 6M")).toBeTruthy();
    expect(within(terms).getByText("400,000")).toBeTruthy();
    expect(screen.getByText("One value made the round work.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Step 01: Commit" }));
    expect(screen.getByText("Five people chose their limits.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /commit bid/i })).toBeNull();
  });

  it("switches between fixture-backed example portfolio outcomes", () => {
    render(<DemoEntry />);
    fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));

    const portfolio = screen.getByRole("region", { name: "Sample portfolio" });
    expect(within(portfolio).getByText("62,500")).toBeTruthy();
    expect(within(portfolio).getByText("120,000")).toBeTruthy();

    fireEvent.click(within(portfolio).getByRole("button", { name: /Bid E/i }));
    expect(within(portfolio).getByText("312,500")).toBeTruthy();
    fireEvent.click(within(portfolio).getByRole("button", { name: /Bid A/i }));
    expect(
      within(portfolio).getByText("Refund in example").parentElement
        ?.textContent,
    ).toContain("100,000");
    expect(
      within(portfolio).getByText(/full deposit is refundable/i),
    ).toBeTruthy();
  });

  it("previews marketplace quotes without changing listing state", () => {
    render(<DemoEntry />);
    fireEvent.click(screen.getByRole("button", { name: "Marketplace" }));

    const market = screen.getByRole("region", { name: "Sample marketplace" });
    expect(within(market).getByText("No live listings")).toBeTruthy();
    expect(within(market).getByText("240")).toBeTruthy();
    fireEvent.click(
      within(market).getByRole("button", { name: /Listing 02/i }),
    );
    expect(within(market).getByText("275")).toBeTruthy();
    fireEvent.change(
      within(market).getByRole("textbox", { name: "Demo tokens to preview" }),
      { target: { value: "7000" } },
    );
    expect(within(market).getByRole("alert").textContent).toMatch(
      /available amount/i,
    );
    expect(within(market).getByText("6,000")).toBeTruthy();
    expect(
      within(market).getByText(/No wallet action, order, or listing change/i),
    ).toBeTruthy();
  });
});
