"use client";

import { useGSAP as useGsapHook } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { EASINGS } from "./tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGsapHook);
}

type UseGsapOptions = {
  scope?: React.RefObject<HTMLElement | null>;
  dependencies?: unknown[];
};

export function useGsap(
  callback: (args: { gsap: typeof gsap; ctx: gsap.Context }) => void | (() => void),
  options: UseGsapOptions = {},
) {
  const defaultScope = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const scope = options.scope ?? defaultScope;

  const dependencies = options.dependencies ?? [pathname];

  useGsapHook(
    (context) => {
      const cleanup = callback({ gsap, ctx: context });
      return () => {
        cleanup?.();
        context.kill();
      };
    },
    {
      scope: scope as React.RefObject<HTMLElement>,
      dependencies,
      revertOnUpdate: true,
    },
  );

  return scope;
}

export function useReducedMotion() {
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = media.matches;
    const handleChange = () => {
      reducedMotion.current = media.matches;
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return () => reducedMotion.current;
}

export function usePointerFine() {
  const pointerFine = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    pointerFine.current = media.matches;
    const handleChange = () => {
      pointerFine.current = media.matches;
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return () => pointerFine.current;
}

export const easings = EASINGS;
export { gsap, ScrollTrigger };
