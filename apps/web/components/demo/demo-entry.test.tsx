// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

const mock = vi.hoisted(() => ({
  ready: true,
  authenticated: false,
  address: "0x00000000000000000000000000000000000000a1",
  emailStatus: "idle",
  sendCode: vi.fn(),
  loginWithCode: vi.fn(),
  initOAuth: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    ready: mock.ready,
    authenticated: mock.authenticated,
    logout: mock.logout,
  }),
  useLogin: () => ({ login: mock.login }),
  useLoginWithEmail: () => ({
    sendCode: mock.sendCode,
    loginWithCode: mock.loginWithCode,
    state: { status: mock.emailStatus },
  }),
  useLoginWithOAuth: () => ({ initOAuth: mock.initOAuth, loading: false }),
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: mock.address }),
  useConnect: () => ({ connectors: [], connect: vi.fn(), isPending: false }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}));

vi.mock("@/lib/config", () => ({
  docsUrl: "https://docs.example.test/",
  localMode: false,
  networkBadge: "Arbitrum Sepolia Testnet",
  privyAppId: "public-test-app-id",
}));

vi.mock("@/components/wallet/providers", () => ({ usePrivyOnboarding: true }));
vi.mock("@/components/offering-panel", () => ({
  OfferingPanel: ({ portfolio }: { portfolio?: boolean }) =>
    portfolio ? "Portfolio transactions" : "Round transactions",
}));
vi.mock("@/components/marketplace-panel", () => ({
  MarketplacePanel: () => "Marketplace transactions",
}));

import { DemoEntry } from "./demo-entry";

beforeEach(() => {
  mock.ready = true;
  mock.authenticated = false;
  mock.address = "0x00000000000000000000000000000000000000a1";
  mock.emailStatus = "idle";
  vi.clearAllMocks();
  mock.sendCode.mockResolvedValue(undefined);
  mock.loginWithCode.mockResolvedValue(undefined);
  mock.initOAuth.mockResolvedValue(undefined);
  mock.logout.mockResolvedValue(undefined);
});

afterEach(cleanup);

describe("demo access", () => {
  it("shows sign in options without mounting transaction panels before authentication", () => {
    render(<DemoEntry />);

    expect(
      screen.getByRole("heading", { name: "Sign in to SAMA." }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Continue with Google" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Continue with Apple" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Continue with a wallet" }),
    ).toBeTruthy();
    expect(screen.queryByText("Round transactions")).toBeNull();
    expect(screen.queryByText("Marketplace transactions")).toBeNull();
  });

  it("does not show either sign in actions or workspace while Privy is initializing", () => {
    mock.ready = false;
    render(<DemoEntry />);

    expect(screen.getByRole("status")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Continue with Google" }),
    ).toBeNull();
    expect(screen.queryByText("Round transactions")).toBeNull();
  });

  it("requests an email code and passes the entered code to Privy", async () => {
    render(<DemoEntry />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with email" }),
    );

    await waitFor(() =>
      expect(mock.sendCode).toHaveBeenCalledWith({
        email: "reader@example.com",
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Check your inbox." }),
    ).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Email code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue to demo" }));
    await waitFor(() =>
      expect(mock.loginWithCode).toHaveBeenCalledWith({ code: "123456" }),
    );
    expect(screen.queryByText("Round transactions")).toBeNull();
  });

  it("shows a recoverable error if email delivery fails", async () => {
    mock.sendCode.mockRejectedValueOnce(new Error("delivery failed"));
    render(<DemoEntry />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with email" }),
    );

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "We could not send a code. Check your email address and try again.",
    );
    expect(
      screen
        .getByRole("button", { name: "Continue with email" })
        .hasAttribute("disabled"),
    ).toBe(false);
  });

  it.each(["google", "apple"] as const)(
    "starts %s sign in using Privy OAuth",
    async (provider) => {
      render(<DemoEntry />);
      const label = provider === "google" ? "Google" : "Apple";
      fireEvent.click(
        screen.getByRole("button", { name: `Continue with ${label}` }),
      );

      await waitFor(() =>
        expect(mock.initOAuth).toHaveBeenCalledWith({ provider }),
      );
      await waitFor(() =>
        expect(
          screen
            .getByRole("button", { name: `Continue with ${label}` })
            .hasAttribute("disabled"),
        ).toBe(false),
      );
    },
  );

  it("opens Privy wallet sign in without bypassing authentication", () => {
    render(<DemoEntry />);
    fireEvent.click(
      screen.getByRole("button", { name: "Continue with a wallet" }),
    );

    expect(mock.login).toHaveBeenCalledWith({ loginMethods: ["wallet"] });
    expect(screen.queryByText("Round transactions")).toBeNull();
  });

  it("keeps the existing round, portfolio, and marketplace inside the authenticated workspace", async () => {
    mock.authenticated = true;
    render(<DemoEntry />);

    expect(await screen.findByText("Round transactions")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Sign in to SAMA." }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "My portfolio" }));
    expect(await screen.findByText("Portfolio transactions")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Marketplace" }));
    expect(await screen.findByText("Marketplace transactions")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Marketplace" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
    expect(mock.logout).toHaveBeenCalledOnce();
  });
});
