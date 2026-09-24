"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/** Progressive enhancement: the entire story remains readable without motion. */
export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const element = root.current;
      if (!element) return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 1024px) and (min-height: 800px) and (prefers-reduced-motion: no-preference)",
        () => {
          element.classList.add("has-scroll-story");
          const scene =
            element.querySelector<HTMLElement>(".sama-campus-stage")!;
          const intro =
            element.querySelector<HTMLElement>(".sama-campus-intro")!;
          const art = element.querySelector<HTMLElement>(".sama-campus-art")!;
          const note = element.querySelector<HTMLElement>(".sama-field-note")!;
          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: scene,
              start: "top 88px",
              end: () => `+=${window.innerHeight * 1.25}`,
              pin: true,
              scrub: 0.9,
              refreshPriority: 1,
              invalidateOnRefresh: true,
            },
          });
          timeline
            .to(intro, { y: -64, autoAlpha: 0, duration: 0.32 }, 0)
            .to(
              art,
              {
                x: () => -scene.clientWidth * 0.44,
                scale: 0.92,
                duration: 0.64,
              },
              0.1,
            )
            .fromTo(
              note,
              { yPercent: -50, y: 24, autoAlpha: 0 },
              { yPercent: -50, y: 0, autoAlpha: 1, duration: 0.23 },
              0.72,
            )
            .to({}, { duration: 0.2 });
          return () => element.classList.remove("has-scroll-story");
        },
        element,
      );
      let disposed = false;
      void document.fonts.ready.then(() => {
        if (!disposed) ScrollTrigger.refresh();
      });
      return () => {
        disposed = true;
        media.revert();
      };
    },
    { scope: root },
  );
  return (
    <div ref={root} className="sama-landing">
      {children}
    </div>
  );
}
