import { Count } from "@/components/ui/amount";
import { Meter } from "@/components/ui/meter";
import { daysLeftLabel } from "@/features/campaigns/lib/filters";
import {
  backerCountText,
  fundingSummary,
  fundingSummaryText,
} from "@/features/campaigns/lib/funding";
import type { Campaign } from "@/features/campaigns/types";
import { formatMoney } from "@/lib/money";

/**
 * The funding figures, in the three shapes the product needs.
 *
 * All three read one `FundingSummary`, so a card, a rail, and the detail header
 * cannot describe the same campaign differently. When the total is not indexed,
 * the block says so and shows the target — it never renders a confident "0%".
 */

function Deadline({
  campaign,
  nowIso,
}: {
  campaign: Campaign;
  nowIso: string;
}) {
  const label = daysLeftLabel(campaign.funding.closesAt, new Date(nowIso));
  const isUrgent = label !== "Funding closed" && !label.includes("days");
  const isClosed = campaign.phase !== "funding";

  return (
    <span
      className={
        isClosed
          ? "text-muted"
          : isUrgent
            ? "font-semibold text-danger"
            : "font-semibold text-ink"
      }
    >
      {campaign.phase === "funding" ? label : "Closed"}
    </span>
  );
}

/** The card shape: one line of figures, a bar, and the deadline. */
export function CampaignFundingCard({
  campaign,
  nowIso,
}: {
  campaign: Campaign;
  nowIso: string;
}) {
  const summary = fundingSummary(campaign);

  return (
    <div>
      {summary.kind === "available" ? (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-semibold tabular-nums text-ink">
              {formatMoney(summary.raised)}{" "}
              <span className="font-medium text-muted">
                / {formatMoney(summary.target)}
              </span>
            </p>
            <p className="shrink-0 text-xs font-semibold tabular-nums text-brand-strong">
              {summary.percentFunded}%
            </p>
          </div>
          <Meter
            className="mt-2"
            ratio={summary.ratio}
            srLabel={`Funding progress for ${campaign.title}`}
            size="sm"
            cap={false}
          />
        </>
      ) : (
        <>
          <p className="text-sm font-semibold tabular-nums text-ink">
            Target {formatMoney(summary.target)}
          </p>
          <p className="mt-1.5 text-xs leading-5 text-muted">
            {summary.kind === "reconciling"
              ? "Funding totals are being reconciled."
              : "Funding figures are not available yet."}
          </p>
        </>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-muted">
        <Deadline campaign={campaign} nowIso={nowIso} />
        <span className="truncate">
          {backerCountText(campaign.funding.backerCount)}
        </span>
      </div>
    </div>
  );
}

/** The rail shape: the headline figure first, because that is what a backer came for. */
export function CampaignFundingRail({
  campaign,
  nowIso,
}: {
  campaign: Campaign;
  nowIso: string;
}) {
  const summary = fundingSummary(campaign);

  return (
    <div>
      {summary.kind === "available" ? (
        <>
          <p className="text-2xl font-bold tracking-[-0.035em] tabular-nums text-ink">
            {formatMoney(summary.raised)}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            raised of {formatMoney(summary.target)}{" "}
            <span className="font-semibold text-brand-strong">
              ({summary.percentFunded}%)
            </span>
          </p>
          <Meter
            className="mt-3"
            ratio={summary.ratio}
            srLabel={`Funding progress for ${campaign.title}`}
            cap={false}
          />
          {summary.overTarget ? (
            <p className="mt-2 text-xs leading-5 text-muted">
              This campaign passed its target. All-or-Nothing means it is funded
              and the plan runs to its milestones.
            </p>
          ) : (
            <p className="mt-2 text-xs leading-5 text-muted">
              {formatMoney(summary.remaining)} still to raise before the
              deadline.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-sm font-semibold tabular-nums text-ink">
            Target {formatMoney(summary.target)}
          </p>
          <div className="mt-3 rounded-xl border border-border bg-canvas px-3 py-2.5">
            <p className="text-xs leading-5 text-muted">
              {summary.kind === "reconciling"
                ? "Funding totals for this campaign are being reconciled against the escrow index. The target is fixed, and no partial figure is shown while they are in doubt."
                : "Funding totals are not available for this campaign yet. The target is published; the amount raised is not."}
            </p>
          </div>
        </>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
        <div>
          <dt className="text-xs text-muted">Time left</dt>
          <dd className="mt-0.5 font-semibold text-ink">
            {daysLeftLabel(campaign.funding.closesAt, new Date(nowIso))}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Backers</dt>
          <dd className="mt-0.5 font-semibold text-ink">
            {campaign.funding.backerCount === null ? (
              "Unavailable"
            ) : (
              <Count value={campaign.funding.backerCount} />
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** One sentence describing the same figures, for surfaces with no room for a bar. */
export function CampaignFundingSummaryLine({
  campaign,
}: {
  campaign: Campaign;
}) {
  return (
    <p className="text-sm leading-6 text-muted">
      {fundingSummaryText(fundingSummary(campaign))}
    </p>
  );
}
