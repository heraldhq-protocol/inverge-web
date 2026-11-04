"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon } from "@hugeicons/core-free-icons";

/**
 * Re-runs the server render for a read that failed.
 *
 * `router.refresh()` refetches the current route without losing scroll
 * position. The label changes while the retry is in flight so a second click
 * cannot look like the first one silently did nothing.
 */
export function RetryButton({ label = "Try again" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [clicked, setClicked] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setClicked(true);
        startTransition(() => router.refresh());
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
    >
      <HugeiconsIcon
        icon={RefreshIcon}
        size={15}
        strokeWidth={1.9}
        aria-hidden="true"
        className={pending ? "motion-safe:animate-spin" : ""}
      />
      {pending ? "Retrying..." : clicked ? "Try again" : label}
    </button>
  );
}
