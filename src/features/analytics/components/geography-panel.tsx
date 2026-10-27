import type { AnalyticsGeographyView } from "@/features/analytics/lib/types";

/**
 * Country-level views for one idea.
 *
 * Geography is derived from a coarse country header at the edge and the IP is
 * discarded before the event is queued. The panel never claims city accuracy
 * and never exposes a visitor-level history.
 */
export function GeographyPanel({
  geography,
}: {
  geography: AnalyticsGeographyView;
}) {
  return (
    <section
      aria-labelledby="geography-countries"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="geography-countries" className="text-sm font-bold text-ink">
            Countries
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-muted">
            Coarse country distribution for this period. The API reports only
            countries above its privacy threshold.
          </p>
        </div>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.625rem] font-semibold text-brand-strong">
          Premium
        </span>
      </div>

      {geography.countries.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {geography.countries.map((country) => {
            const share =
              country.sharePct ??
              (geography.totalViews > 0
                ? (country.views / geography.totalViews) * 100
                : 0);
            return (
              <li key={country.countryCode}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium text-ink">
                    {country.label}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {country.views.toLocaleString("en-US")} view
                    {country.views === 1 ? "" : "s"} - {Math.round(share)}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.round(share)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-xs leading-5 text-muted">
          No country data is available for this period.
        </p>
      )}

      {geography.truncated ? (
        <p className="mt-3 text-[0.625rem] leading-4 text-muted">
          Countries below the reporting threshold are omitted from this list.
        </p>
      ) : null}
    </section>
  );
}
