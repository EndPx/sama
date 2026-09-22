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
        "(min-width: 1024px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)",
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
              start: "top top",
              end: () => `+=${window.innerHeight * 1.25}`,
              pin: true,
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });
          timeline
            .to(intro, { y: -64, autoAlpha: 0, duration: 0.32 }, 0)
            .to(".sama-scroll-caption", { autoAlpha: 0, duration: 0.12 }, 0)
            .to(
              art,
              {
                x: () => -scene.clientWidth * 0.44,
                y: -12,
                scale: 0.9,
                duration: 0.64,
              },
              0.1,
            )
            .fromTo(
              note,
              { y: 64, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.3 },
              0.46,
            )
            .fromTo(
              ".sama-field-note li",
              { x: 20, autoAlpha: 0 },
              { x: 0, autoAlpha: 1, duration: 0.18, stagger: 0.09 },
              0.62,
            )
            .to({}, { duration: 0.2 });
          return () => element.classList.remove("has-scroll-story");
        },
        element,
      );
      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils
            .toArray<HTMLElement>("[data-reveal]", element)
            .forEach((target) => {
              gsap.from(target, {
                y: 24,
                opacity: 0.3,
                duration: 0.65,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: target,
                  start: "top 94%",
                  once: true,
                },
              });
            });
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
