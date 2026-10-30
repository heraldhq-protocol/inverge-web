"use client";

import { useEffect, useState } from "react";

import type { MediaCapabilities } from "@/features/media/lib/media-ref";

/**
 * What this deployment accepts.
 *
 * Read once per page load and shared by every upload control, so a form with
 * several image fields does not ask the same question repeatedly. A failed read
 * is not cached: a transient network error should not disable uploading until
 * the tab is reloaded.
 */
let pending: Promise<MediaCapabilities | null> | null = null;

export function loadMediaCapabilities(): Promise<MediaCapabilities | null> {
  if (!pending) {
    pending = fetch("/api/media/config", { cache: "no-store" })
      .then((response) =>
        response.ok ? (response.json() as Promise<MediaCapabilities>) : null,
      )
      .catch(() => null)
      .then((capabilities) => {
        if (!capabilities) pending = null;
        return capabilities;
      });
  }

  return pending;
}

export function useMediaCapabilities(): {
  capabilities: MediaCapabilities | null;
  loading: boolean;
} {
  const [capabilities, setCapabilities] = useState<MediaCapabilities | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void loadMediaCapabilities().then((value) => {
      if (!active) return;
      setCapabilities(value);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return { capabilities, loading };
}
