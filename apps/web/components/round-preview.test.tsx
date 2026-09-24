import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RoundPreview } from "./round-preview";

describe("round preview", () => {
  it("renders the locked five-bid fixture without changing its accounting", () => {
    const html = renderToStaticMarkup(<RoundPreview />);

    expect(html).toContain("4.8M");
    expect(html).toContain("700,000 deposited");
    expect(html).toContain("480,000 accepted + 220,000 refundable");
    expect(html).toContain(
      "Bidder B: 150,000 deposited; 30,000 accepted; 120,000 refundable.",
    );
    expect(html).toContain(
      "Bidder A: 100,000 deposited; 0 accepted; 100,000 refundable.",
    );
    expect(html).toContain("Simulated round");
  });
});
