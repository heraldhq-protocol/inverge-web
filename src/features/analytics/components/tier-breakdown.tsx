import type { AnalyticsDataset } from "@/features/analytics/content/preview-analytics";

/**
 * Verification mix behind the support count. The weight explains how much an
 * account contributes to the ideathon score; it is never a judgement of the
 * person or the value of their support.
 */
export function TierBreakdown({
  tiers,
}: {
  tiers: AnalyticsDataset["supportersByTier"];
}) {
  const total = tiers.reduce((sum, tier) => sum + tier.count, 0);

  return (
    <section
      aria-labelledby="supporters-by-tier"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2 id="supporters-by-tier" className="text-sm font-bold text-ink">
        Supporters by verification
      </h2>
      <p className="mt-0.5 text-xs text-muted">
        How the support count is made up. Verification affects ideathon weight,
        not whether an idea is worth building.
      </p>

      {total > 0 ? (
        <ul className="mt-4 space-y-3">
          {tiers.map((tier) => {
            const share = total > 0 ? tier.count / total : 0;
            return (
              <li key={tier.tier}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium text-ink">
                    {tier.tier}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {tier.count.toLocaleString("en-US")} · weight {tier.weight}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.round(share * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-4 text-xs text-muted">
          No supporters yet.
        </p>
      )}
    </section>
  );
}
