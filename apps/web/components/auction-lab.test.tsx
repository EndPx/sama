// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AuctionLab } from "./auction-lab";

afterEach(cleanup);

describe("interactive auction illustration", () => {
  it("starts at the public reference result, then recalculates and resets", () => {
    render(<AuctionLab />);
    expect(screen.getByText("480K")).toBeTruthy();
    expect(screen.getByText("220K")).toBeTruthy();
    expect(screen.getByText("Clears here")).toBeTruthy();

    fireEvent.change(screen.getByRole("slider", { name: /Bidder E deposit/ }), {
      target: { value: "0" },
    });
    expect(screen.getByText("450K", { selector: "strong" })).toBeTruthy();
    expect(screen.getByText("100K", { selector: "strong" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Reset five bids/ }));
    expect(screen.getByText("480K")).toBeTruthy();
    expect(screen.getByText("220K")).toBeTruthy();
  });

  it("explains a failed round without presenting an on-chain action", () => {
    render(<AuctionLab />);
    for (const bidder of ["E", "D", "C", "B", "A"]) {
      fireEvent.change(
        screen.getByRole("slider", {
          name: new RegExp(`Bidder ${bidder} deposit`),
        }),
        {
          target: { value: "0" },
        },
      );
    }
    expect(screen.getByText("No clear")).toBeTruthy();
    expect(screen.getByText("Minimum raise not met")).toBeTruthy();
    expect(screen.getByText(/no wallet transaction/i)).toBeTruthy();
  });
});
