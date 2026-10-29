"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Next 16 keeps the previous scroll position when the next page is already
 * visible in the viewport. Marketing pages are long, so that reads as a broken
 * navigation: the new page opens part-way down.
 *
 * This resets the window before paint on a pathname change, but leaves hash
 * links (which should land on their target) and browser back/forward (which
 * should restore the previous position) alone.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const isHistoryNavigation = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const handlePopState = () => {
      isHistoryNavigation.current = true;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;

    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }

    if (window.location.hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
