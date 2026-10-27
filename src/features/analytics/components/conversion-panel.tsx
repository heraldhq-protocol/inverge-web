import type { AnalyticsConversionView } from "@/features/analytics/lib/types";

function rate(value: number | null): string {
  return value === null ? "Not available" : `${value.toFixed(1)}%`;
}

/**
 * Premium conversion rates.
 *
 * Every rate uses views in the selected period as its denominator. The API
 * returns `null` when the denominator is zero, so this component never prints a
 * fabricated 0% for an idea nobody viewed.
 */
export function ConversionPanel({
  conversion,
}: {
  conversion: AnalyticsConversionView;
}) {
  const items = [
    { label: "View to supporter", value: conversion.viewToSupportPct },
    { label: "View to feedback", value: conversion.viewToFeedbackPct },
    { label: "View to comment", value: conversion.viewToCommentPct },
  ] as const;

  return (
    <section
      aria-labelledby="conversion-rates"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="conversion-rates" className="text-sm font-bold text-ink">
            Conversion rates
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            Confirmed outcomes divided by views in this period. A missing rate
            means there were no views, not that the outcome was zero.
          </p>
        </div>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] font-semibold text-brand-strong">
          Premium
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-canvas p-3">
            <dt className="text-[0.6875rem] text-muted">{item.label}</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-ink">
              {rate(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
