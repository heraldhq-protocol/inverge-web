import type { ReactNode } from "react";

import { LineChart, type ChartPoint } from "@/features/analytics/components/line-chart";
import { formatSeriesDate } from "@/features/analytics/lib/analytics";

/**
 * Chart panel with a native, expandable data table. The table is the accessible
 * alternative to the line: a reader can inspect every value without hovering a
 * pointer over the diagram, and it stays usable at narrow widths.
 */
export function AnalyticsChartPanel({
  title,
  description,
  legend,
  points,
  formatValue,
  summary,
  tone = "brand",
  action,
}: {
  title: string;
  description: string;
  legend: string;
  points: readonly ChartPoint[];
  formatValue: (value: number) => string;
  summary: string;
  tone?: "brand" | "chain";
  action?: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
        </div>
        <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium text-muted">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${
              tone === "chain" ? "bg-chain" : "bg-brand"
            }`}
          />
          {legend}
        </p>
      </div>

      {action ? <div className="mt-2">{action}</div> : null}

      <div className="mt-3">
        <LineChart
          points={points}
          formatValue={formatValue}
          formatDate={(iso) => formatSeriesDate(iso)}
          summary={summary}
          tone={tone}
        />
      </div>

      <details className="mt-1 border-t border-border pt-2">
        <summary className="cursor-pointer rounded text-xs font-semibold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          View daily figures
        </summary>
        <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">
              Daily figures for {title}. {summary}
            </caption>
            <thead className="sticky top-0 bg-canvas text-[0.625rem] uppercase tracking-[0.08em] text-muted">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  {legend}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...points].reverse().map((point) => (
                <tr key={point.date}>
                  <th
                    scope="row"
                    className="px-3 py-1.5 font-normal text-ink-soft"
                  >
                    <time dateTime={point.date}>
                      {formatSeriesDate(point.date, true)}
                    </time>
                  </th>
                  <td className="px-3 py-1.5 text-right tabular-nums text-ink">
                    {formatValue(point.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
