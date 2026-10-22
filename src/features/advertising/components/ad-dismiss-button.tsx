"use client";

import { useSyncExternalStore } from "react";

import {
  dismissAd,
  getDismissedAdsSnapshot,
  getServerDismissedAdsSnapshot,
  subscribeDismissedAds,
} from "@/features/advertising/lib/dismissed-store";

/**
 * A quiet dismissal control, separate from consent. It has a full text label
 * rather than an ambiguous × so it is understandable out of context.
 */
export function AdDismissButton({ creativeId }: { creativeId: string }) {
  const dismissed = useSyncExternalStore(
    subscribeDismissedAds,
    getDismissedAdsSnapshot,
    getServerDismissedAdsSnapshot,
  );

  if (dismissed.includes(creativeId)) return null;

  return (
    <button
      type="button"
      onClick={() => dismissAd(creativeId)}
      className="inline-flex min-h-8 items-center rounded-md px-1.5 text-[0.6875rem] font-medium text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      Dismiss ad
    </button>
  );
}
