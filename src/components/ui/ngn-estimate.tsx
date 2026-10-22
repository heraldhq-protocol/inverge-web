"use client";

import { useSyncExternalStore } from "react";

import { browserLocaleEvidence, shouldShowNgnEstimate } from "@/lib/geo";
import { estimateNgn } from "@/lib/fx";
import type { MoneyAmount } from "@/lib/money";

/**
 * A rounded naira estimate shown beside a USD figure.
 *
 * The estimate is hidden unless the reader's device signals Nigeria (Lagos
 * timezone or an `NG` locale). Server rendering therefore emits nothing, and the
 * line appears only after hydration — no mismatch, and no naira noise for
 * readers it does not help.
 *
 * The USD value remains canonical. This is never used for payment arithmetic.
 */

let visibility: boolean | null = null;

function getVisibility(): boolean {
  if (visibility === null)
    visibility = shouldShowNgnEstimate(browserLocaleEvidence());
  return visibility;
}

// The device's locale is fixed for the session; there is nothing to subscribe to.
function subscribe(): () => void {
  return () => {};
}

function getServerVisibility(): boolean {
  return false;
}

function useShowsNgnEstimate(): boolean {
  return useSyncExternalStore(subscribe, getVisibility, getServerVisibility);
}

export function NgnEstimate({
  amount,
  block = false,
  className = "",
  prefix,
  showRate = false,
}: {
  amount: MoneyAmount;
  /** Render a `<p>` so a hidden estimate leaves no empty wrapper behind. */
  block?: boolean;
  className?: string;
  /** Optional leading label, e.g. "Estimated prize pool in naira: ". */
  prefix?: string;
  showRate?: boolean;
}) {
  const visible = useShowsNgnEstimate();
  if (!visible) return null;

  const estimate = estimateNgn(amount);
  if (estimate.atomic === "0") return null;

  const content = (
    <>
      {prefix ? <span className="text-muted">{prefix}</span> : null}
      <span className="tabular-nums" aria-hidden="true">
        ≈ {estimate.formatted}
      </span>
      <span className="text-[0.625rem] font-normal text-muted">
        {showRate
          ? `at ₦${estimate.rate.toLocaleString("en-NG")}/$1`
          : "est. NGN"}
      </span>
      <span className="sr-only">
        Estimated at {estimate.rate.toLocaleString("en-NG")} naira per US
        dollar, rounded to the nearest thousand naira. The USD figure is the
        recorded amount.
      </span>
    </>
  );

  if (block) {
    return (
      <p className={`flex flex-wrap items-baseline gap-1 ${className}`}>
        {content}
      </p>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-1 ${className}`}>
      {content}
    </span>
  );
}
