"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import {
  DURATIONS,
  EASINGS,
  STAGGER_STEP,
} from "@/features/marketing/motion/tokens";
import { useGsap } from "@/features/marketing/motion/use-gsap";

const REVEAL_FROM = {
  up: { y: 24 },
  left: { x: -32 },
  right: { x: 32 },
  scale: { scale: 0.96 },
  fade: {},
} as const;

type RevealVariant = keyof typeof REVEAL_FROM;

function getVariant(value: string | null): RevealVariant {
  if (value && value in REVEAL_FROM) {
    return value as RevealVariant;
  }
  return "up";
}

function getDelay(element: HTMLElement): number {
  const delay = Number.parseFloat(element.dataset.revealDelay ?? "");
  return Number.isFinite(delay) ? delay : 0;
}

function getStagger(element: HTMLElement): number {
  const stagger = Number.parseFloat(element.dataset.revealStagger ?? "");
  return Number.isFinite(stagger) ? stagger : STAGGER_STEP;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGsap(
    ({ gsap: g }) => {
      const scope = root.current;
      if (!scope) {
        return;
      }

      const media = g.matchMedia();
      let refreshPriority = 0;
      let resizeFrame = 0;

      const revealAll = (elements: Element[]) => {
        if (elements.length === 0) {
          return;
        }
        g.set(elements, { clearProps: "all" });
      };

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const hero = scope.querySelector<HTMLElement>("[data-hero]");
        if (hero) {
          const items = hero.querySelectorAll<HTMLElement>("[data-hero-item]");
          if (items.length > 0) {
            g.fromTo(
              items,
              { autoAlpha: 0, y: 20 },
              {
                autoAlpha: 1,
                y: 0,
                duration: DURATIONS.base,
                ease: EASINGS.standard,
                stagger: STAGGER_STEP,
                delay: 0.05,
              },
            );
          }
        }

        scope
          .querySelectorAll<HTMLElement>("[data-reveal]")
          .forEach((element) => {
            const variant = getVariant(element.getAttribute("data-reveal"));
            g.fromTo(
              element,
              { autoAlpha: 0, ...REVEAL_FROM[variant] },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: DURATIONS.base,
                ease: EASINGS.standard,
                delay: getDelay(element),
                scrollTrigger: {
                  trigger: element,
                  start: "top 85%",
                  once: true,
                  refreshPriority: refreshPriority++,
                },
              },
            );
          });

        scope
          .querySelectorAll<HTMLElement>("[data-reveal-stagger]")
          .forEach((group) => {
            const items = Array.from(group.children).filter(
              (child): child is HTMLElement => child instanceof HTMLElement,
            );
            if (items.length === 0) {
              return;
            }
            g.fromTo(
              items,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: DURATIONS.base,
                ease: EASINGS.standard,
                stagger: getStagger(group),
                scrollTrigger: {
                  trigger: group,
                  start: "top 85%",
                  once: true,
                  refreshPriority: refreshPriority++,
                },
              },
            );
          });

        scope
          .querySelectorAll<HTMLElement>("[data-reveal-rule]")
          .forEach((rule) => {
            g.fromTo(
              rule,
              { scaleX: 0, transformOrigin: "left center" },
              {
                scaleX: 1,
                duration: DURATIONS.base,
                ease: EASINGS.standard,
                delay: getDelay(rule),
                scrollTrigger: {
                  trigger: rule,
                  start: "top 90%",
                  once: true,
                  refreshPriority: refreshPriority++,
                },
              },
            );
          });

        scope
          .querySelectorAll<HTMLElement>("[data-parallax]")
          .forEach((element) => {
            const trigger =
              element.closest<HTMLElement>("[data-parallax-scope]") ?? element;
            g.set(element, { scale: 1.06 });
            g.fromTo(
              element,
              { yPercent: -3 },
              {
                yPercent: 3,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        revealAll(
          Array.from(
            scope.querySelectorAll(
              "[data-reveal], [data-reveal-stagger] > *, [data-hero-item], [data-reveal-rule]",
            ),
          ),
        );
      });

      scope.removeAttribute("data-motion");

      const scheduleRefresh = () => {
        if (resizeFrame) {
          window.cancelAnimationFrame(resizeFrame);
        }
        resizeFrame = window.requestAnimationFrame(() =>
          ScrollTrigger.refresh(),
        );
      };

      const resizeObserver = new ResizeObserver(scheduleRefresh);
      resizeObserver.observe(scope);
      window.addEventListener("load", scheduleRefresh);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("load", scheduleRefresh);
        if (resizeFrame) {
          window.cancelAnimationFrame(resizeFrame);
        }
        media.revert();
        ScrollTrigger.refresh();
      };
    },
    { scope: root, dependencies: [pathname] },
  );

  return (
    <div ref={root} data-motion="ready" data-motion-root>
      {children}
    </div>
  );
}
