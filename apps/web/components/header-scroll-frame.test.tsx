// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HeaderScrollFrame } from "./header-scroll-frame";

function setScrollPosition(value: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value });
  fireEvent.scroll(window);
}

afterEach(() => {
  cleanup();
  setScrollPosition(0);
});

describe("sticky header divider", () => {
  it("appears after scrolling and disappears again at the top", () => {
    setScrollPosition(0);
    render(<HeaderScrollFrame>Navigation</HeaderScrollFrame>);

    const header = screen.getByRole("banner");
    expect(header.getAttribute("data-scrolled")).toBe("false");

    setScrollPosition(24);
    expect(header.getAttribute("data-scrolled")).toBe("true");

    setScrollPosition(0);
    expect(header.getAttribute("data-scrolled")).toBe("false");
  });

  it("starts with the divider visible when loaded mid-page", () => {
    setScrollPosition(240);
    render(<HeaderScrollFrame>Navigation</HeaderScrollFrame>);

    expect(screen.getByRole("banner").getAttribute("data-scrolled")).toBe(
      "true",
    );
  });
});
