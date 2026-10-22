"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ANALYTICS_PERIODS,
  type AnalyticsPeriod,
} from "@/features/analytics/lib/analytics";

/**
 * Period selector. The choice lives in the URL so a creator can share or
 * reload the same view. `replace` keeps the back button focused on real
 * navigation rather than each period change.
 */
export function AnalyticsPeriodSelect({ period }: { period: AnalyticsPeriod }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function choose(next: AnalyticsPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", String(next));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      role="group"
      aria-label="Comparison period"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5"
    >
      {ANALYTICS_PERIODS.map((option) => {
        const selected = option === period;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => choose(option)}
            className={`inline-flex min-h-8 items-center rounded-md px-2.5 text-xs font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              selected
                ? "bg-brand-soft text-brand-strong"
                : "text-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            {option}d
          </button>
        );
      })}
    </div>
  );
}
