import type { AnalyticsAcquisitionView } from "@/features/analytics/lib/types";

function shareFor(
  source: AnalyticsAcquisitionView["sources"][number],
  totalViews: number,
): number | null {
  if (source.sharePct !== null) return source.sharePct;
  return totalViews > 0 ? (source.views / totalViews) * 100 : null;
}

/**
 * Acquisition sources for one idea.
 *
 * The source is derived server-side from the page that produced the view. The
 * web producer does not collect a referrer, UTM string, or free-text campaign
 * value, so this panel never implies attribution that was not recorded.
 */
export function AcquisitionPanel({
  acquisition,
  compact = false,
}: {
  acquisition: AnalyticsAcquisitionView;
  compact?: boolean;
}) {
  return (
    <section
      aria-labelledby="acquisition-sources"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="acquisition-sources" className="text-sm font-bold text-ink">
            Acquisition sources
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            How readers reached this idea. Source is derived on the server; no
            referrer, UTM string, or browser history is stored.
          </p>
        </div>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] font-semibold text-brand-strong">
          Premium
        </span>
      </div>

      {acquisition.sources.length > 0 ? (
        <ul className={compact ? "mt-3 space-y-2.5" : "mt-4 space-y-3"}>
          {acquisition.sources.map((source) => {
            const share = shareFor(source, acquisition.totalViews);
            return (
              <li key={source.source}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium text-ink">
                    {source.label}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {source.views.toLocaleString("en-US")} view
                    {source.views === 1 ? "" : "s"}
                    {share !== null ? ` - ${Math.round(share)}%` : ""}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{
                      width: `${share === null ? 0 : Math.round(share)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[0.625rem] text-muted">
                  {source.uniqueSessions.toLocaleString("en-US")} unique session
                  {source.uniqueSessions === 1 ? "" : "s"}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-xs leading-5 text-muted">
          No source data is available for this period. Views still appear in the
          traffic totals.
        </p>
      )}
    </section>
  );
}
