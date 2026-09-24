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
  it("opens on an account dashboard, not a product explainer", () => {
    render(<DemoEntry />);

    expect(screen.getByRole("heading", { name: "Overview" })).toBeTruthy();
    expect(screen.getByText("62,500")).toBeTruthy();
    expect(screen.getByText("120,000")).toBeTruthy();
    expect(screen.getAllByText("Sample data").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sample account B").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Recent activity" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Market watch" })).toBeTruthy();
    expect(
      screen.queryByText(/a clearer way to join a public round/i),
    ).toBeNull();
    expect(screen.queryByText(/what sama does/i)).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: /sign in|connect wallet|buy|claim/i,
      }),
    ).toBeNull();
  });

  it("shows exact settlement values when reviewing the round ledger", () => {
    render(<DemoEntry />);
    fireEvent.click(screen.getByRole("button", { name: "Review round" }));

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

  it("shows locked terms as a settled round record without an educational stepper", () => {
    render(<DemoEntry />);

    fireEvent.click(screen.getByRole("button", { name: "Review round" }));
    const terms = screen.getByRole("region", { name: "Reference offer terms" });
    expect(within(terms).getByText("10%")).toBeTruthy();
    expect(within(terms).getByText("4M to 6M")).toBeTruthy();
    expect(within(terms).getByText("400,000")).toBeTruthy();
    expect(screen.getByText("Settled")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Step 01: Commit/i }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /commit bid/i })).toBeNull();
  });

  it("keeps the selected fixture account consistent across portfolio and overview", () => {
    render(<DemoEntry />);
    fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));

    const portfolio = screen.getByRole("region", { name: "Sample portfolio" });
    expect(within(portfolio).getByText("62,500")).toBeTruthy();
    expect(within(portfolio).getByText("120,000")).toBeTruthy();

    fireEvent.change(
      within(portfolio).getByRole("combobox", { name: "Sample account" }),
      {
        target: { value: "E" },
      },
    );
    expect(within(portfolio).getByText("312,500")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    expect(screen.getAllByText("Sample account E").length).toBeGreaterThan(0);
    expect(screen.getByText("312,500")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));
    const updatedPortfolio = screen.getByRole("region", {
      name: "Sample portfolio",
    });
    fireEvent.change(
      within(updatedPortfolio).getByRole("combobox", {
        name: "Sample account",
      }),
      { target: { value: "A" } },
    );
    expect(
      within(updatedPortfolio).getByText("Refundable").parentElement
        ?.textContent,
    ).toContain("100,000");
    expect(
      within(updatedPortfolio).getAllByText("Full refund").length,
    ).toBeGreaterThan(0);
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
      within(market).getByRole("textbox", { name: "Demo tokens" }),
      { target: { value: "7000" } },
    );
    expect(within(market).getByRole("alert").textContent).toMatch(
      /available amount/i,
    );
    expect(within(market).getByText("6,000")).toBeTruthy();
    expect(
      within(market).getByText(/Sample quote only. No order submitted/i),
    ).toBeTruthy();
  });
});
