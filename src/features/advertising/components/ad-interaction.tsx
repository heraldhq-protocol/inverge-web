"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

import { trackAdEvent } from "@/features/advertising/lib/client-events";
import {
  getDismissedAdsSnapshot,
  getServerDismissedAdsSnapshot,
  subscribeDismissedAds,
} from "@/features/advertising/lib/dismissed-store";
import type { AdPlacementId } from "@/features/advertising/types";

const VISIBILITY_THRESHOLD = 0.5;
const VISIBLE_FOR_MS = 1_000;

/**
 * Impression wrapper and dismissal boundary.
 *
 * An impression is sent only after half the placement has been on screen for a
 * full second. A server render therefore counts as rendered, not as seen. If
 * `IntersectionObserver` is unavailable, no impression is fabricated.
 */
export function AdInteraction({
  children,
  className = "",
  creativeId,
  placementId,
}: {
  children: ReactNode;
  className?: string;
  creativeId: string;
  placementId: AdPlacementId;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dismissed = useSyncExternalStore(
    subscribeDismissedAds,
    getDismissedAdsSnapshot,
    getServerDismissedAdsSnapshot,
  );

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const element = ref.current;
    if (!element) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let counted = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) =>
            entry.isIntersecting &&
            entry.intersectionRatio >= VISIBILITY_THRESHOLD,
        );

        if (visible && !counted && timer === undefined) {
          timer = setTimeout(() => {
            counted = true;
            trackAdEvent("ad_impression", creativeId, placementId);
          }, VISIBLE_FOR_MS);
        } else if (!visible && timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: [0, VISIBILITY_THRESHOLD, 1] },
    );

    observer.observe(element);

    return () => {
      if (timer !== undefined) clearTimeout(timer);
      observer.disconnect();
    };
  }, [creativeId, placementId]);

  if (dismissed.includes(creativeId)) return null;

  return (
    <div
      ref={ref}
      className={className}
      data-ad-creative={creativeId}
      data-ad-placement={placementId}
    >
      {children}
    </div>
  );
}
