// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

const mock = vi.hoisted(() => ({
  address: undefined as string | undefined,
  configured: false,
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: mock.address }),
}));

vi.mock("@/lib/config", () => ({
  get configured() {
    return mock.configured;
  },
  docsUrl: "https://docs.example.test/",
  networkBadge: "Arbitrum Sepolia Testnet",
}));

vi.mock("@/components/offering-panel", () => ({
  OfferingPanel: ({ portfolio }: { portfolio?: boolean }) =>
    portfolio ? "Portfolio transactions" : "Round transactions",
}));
vi.mock("@/components/marketplace-panel", () => ({
  MarketplacePanel: () => "Marketplace transactions",
}));

import { DemoEntry } from "./demo-entry";

beforeEach(() => {
  mock.address = undefined;
  mock.configured = false;
});
afterEach(cleanup);

describe("direct demo preview", () => {
  it("opens the product without login or a connected wallet", () => {
    render(<DemoEntry />);

    expect(
      screen.getByRole("heading", {
        name: "A clearer way to join a public round.",
      }),
    ).toBeTruthy();
    expect(screen.getByText("No wallet connected")).toBeTruthy();
    expect(screen.getByText("Fixed example, not live activity")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /sign in/i })).toBeNull();
    expect(screen.queryByText("Round transactions")).toBeNull();
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
    expect(
      within(detail).getByText(/full deposit can be claimed back/i),
    ).toBeTruthy();
  });

  it("keeps preview views reachable without fabricating transaction controls", () => {
    render(<DemoEntry />);

    fireEvent.click(screen.getByRole("button", { name: "Explore the round" }));
    expect(screen.getByText("The round will open here.")).toBeTruthy();
    const terms = screen.getByRole("region", { name: "Reference offer terms" });
    expect(within(terms).getByText("10%")).toBeTruthy();
    expect(within(terms).getByText("4M to 6M")).toBeTruthy();
    expect(within(terms).getByText("400,000")).toBeTruthy();
    expect(
      screen.getByText(/Public transactions are not available yet/i),
    ).toBeTruthy();
    expect(screen.queryByText("Round transactions")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));
    expect(screen.getByText("Your activity belongs here.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Marketplace" }));
    expect(screen.getByText("The marketplace follows the round.")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Marketplace" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("mounts the existing transaction panels when a deployment is configured", async () => {
    mock.configured = true;
    render(<DemoEntry />);

    fireEvent.click(screen.getByRole("button", { name: "The round" }));
    expect(await screen.findByText("Round transactions")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));
    expect(await screen.findByText("Portfolio transactions")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Marketplace" }));
    expect(await screen.findByText("Marketplace transactions")).toBeTruthy();
    expect(screen.queryByText("The round will open here.")).toBeNull();
  });
});
