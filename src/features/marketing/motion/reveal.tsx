"use client";

import { useRef } from "react";

import { DISTANCES, DURATIONS, EASINGS, STAGGER_STEP } from "./tokens";
import { useGsap, useReducedMotion } from "./use-gsap";

const REVEAL_FROM = {
  up: { y: DISTANCES[24] },
  left: { x: -DISTANCES[32] },
  right: { x: DISTANCES[32] },
  scale: { scale: 0.96 },
  fade: {},
} as const;

type RevealVariant = keyof typeof REVEAL_FROM;

type RevealProps = {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  stagger?: number;
  once?: boolean;
  className?: string;
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  stagger = STAGGER_STEP,
  once = true,
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();

  useGsap(({ gsap: g, ctx }) => {
    if (!ref.current) {
      return;
    }
    if (isReducedMotion()) {
      g.set(ref.current.children, { clearProps: "all" });
      return;
    }

    const from = REVEAL_FROM[variant];
    g.fromTo(
      ref.current.children,
      { autoAlpha: 0, ...from },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: DURATIONS.base,
        ease: EASINGS.standard,
        delay,
        stagger,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once,
        },
      },
    );
  });


  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
