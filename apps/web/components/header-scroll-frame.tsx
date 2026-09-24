"use client";

import React, { useEffect, useState, type ReactNode } from "react";

export function HeaderScrollFrame({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 0);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      {children}
    </header>
  );
}
