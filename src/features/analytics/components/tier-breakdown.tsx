import type { AnalyticsTierView } from "@/features/analytics/lib/types";
import { formatMoney } from "@/lib/money";

/**
 * The verification mix behind estimated interest.
 *
 * Live data comes from the pre-pledge report, not from supporter identities, so
 * the copy says "pre-pledge" rather than presenting the mix as supporters. The
 * weight explains how much an account contributes to the ideathon score; it is
 * never a judgement of the person or the value of their support.
 */
export function TierBreakdown({
  tiers,
  title = "Estimated interest by verification",
  description = "The pre-pledge mix behind the weighted estimate. Verification affects ideathon weight, not whether an idea is worth building.",
  emptyLabel = "No pre-pledges yet.",
}: {
  tiers: readonly AnalyticsTierView[];
  title?: string;
  description?: string;
  emptyLabel?: string;
}) {
  const total = tiers.reduce((sum, tier) => sum + tier.count, 0);

  return (
    <section
      aria-labelledby="interest-by-verification"
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
    >
      <h2 id="interest-by-verification" className="text-sm font-bold text-ink">
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-muted">{description}</p>

      {total > 0 ? (
        <ul className="mt-4 space-y-3">
          {tiers.map((tier) => {
            const share = total > 0 ? tier.count / total : 0;
            const detail = tier.weight
              ? `weight ${tier.weight}`
              : tier.weighted
                ? `${formatMoney(tier.weighted)} weighted`
                : null;
            return (
              <li key={tier.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium text-ink">
                    {tier.label}
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {tier.count.toLocaleString("en-US")}
                    {detail ? ` - ${detail}` : ""}
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
          {emptyLabel}
        </p>
      )}
    </section>
  );
}
