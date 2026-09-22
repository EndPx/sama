"use client";

import Script from "next/script";

export function DevTools() {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_DISABLE_REACT_DEVTOOLS === "1"
  )
    return null;
  return (
    <>
      <Script src="/dev-tools/grab" strategy="afterInteractive" />
      <Script src="/dev-tools/scan" strategy="afterInteractive" />
    </>
  );
}
