"use client";

import Script from "next/script";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { shouldRenderThirdPartyAd } from "@/features/advertising/lib/consent";
import {
  getAdConsentSnapshot,
  getServerAdConsentSnapshot,
  subscribeAdConsent,
} from "@/features/advertising/lib/consent-store";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Isolated third-party advertising adapter.
 *
 * The only provider-specific code in the product lives here. It renders nothing
 * unless a client and slot id are configured, and nothing at all until the
 * visitor has explicitly chosen personalised advertising. It does not scan or
 * mutate the rest of the DOM: the provider gets its own `<ins>` element and the
 * documented queue push.
 */
export function ThirdPartyAdSlot({
  clientId,
  placementLabel = "Third-party advertisement",
  slotId,
}: {
  clientId: string | undefined;
  placementLabel?: string;
  slotId: string | undefined;
}) {
  const consent = useSyncExternalStore(
    subscribeAdConsent,
    getAdConsentSnapshot,
    getServerAdConsentSnapshot,
  );

  if (!clientId || !slotId) return null;
  if (!shouldRenderThirdPartyAd({ clientId, consent, slotId })) return null;

  return (
    <aside
      aria-label={placementLabel}
      className="overflow-hidden rounded-2xl border border-border bg-surface p-3"
    >
      <p className="mb-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted">
        Advertisement · chosen by Google
      </p>
      <AdSenseUnit clientId={clientId} slotId={slotId} />
      <Script
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
          clientId,
        )}`}
        strategy="afterInteractive"
      />
    </aside>
  );
}

function AdSenseUnit({
  clientId,
  slotId,
}: {
  clientId: string;
  slotId: string;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // A blocked script or an unapproved publisher leaves the labelled slot
      // empty. It never falls back to a house ad that looks like editorial.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block"
      data-ad-client={clientId}
      data-ad-format="auto"
      data-ad-slot={slotId}
      data-full-width-responsive="true"
    />
  );
}
