"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Next.js App Router preserves window scroll position on client navigation
 * when the viewport target is already visible or shares layout state.
 *
 * This resets the window scroll position before paint on a pathname change across
 * all pages, while respecting:
 * - Browser back / forward buttons (popstate history navigation)
 * - In-page anchor hash links (e.g. #section)
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
