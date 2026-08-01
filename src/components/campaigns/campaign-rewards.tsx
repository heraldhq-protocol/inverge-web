import { Amount, Count } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { parseDecimal, pluralise } from '@/lib/format';
import type { CampaignDetail, RewardTier } from '@/lib/campaigns/types';

const SHIPPING_LABEL: Record<RewardTier['shipping'], string> = {
  NOTHING_TO_SHIP: 'Nothing to post',
  REGION_ONLY: 'Posted within the region',
  WORLDWIDE: 'Posted anywhere in the world',
};

/**
 * Reward tiers, as a backer reads them.
 *
 * The reference's Rewards tab is its second tab and its whole sales surface (teardown §5.2). Ours is
 * fourth, behind the stages, the plan and the creator, because on this product the tiers are a
 * thank-you and the stages are the thing being bought. A campaign with no tiers is normal and says so
 * rather than rendering an empty tab.
 *
 * Two devices taken from the reference because both are honest:
 *
 * - **The scarcity line**, "44 left of 250", with a meter. It renders a real cap, and a cap that is
 *   nearly gone is genuinely useful information rather than manufactured pressure — which is why it
 *   only appears when a limit was actually set.
 * - **Per-tier delivery**, beside the price, because that is the pair a backer is comparing.
 *
 * The note at the foot is the part with no analogue: on Kickstarter a reward *is* the deal, so a
 * missed date is the whole dispute. Here the stages are the deal, and a backer needs to know that a
 * late tier is not what the objection mechanism is for.
 */
export function CampaignRewards({ campaign }: { campaign: CampaignDetail }) {
  if (campaign.rewards.length === 0) {
    return (
      <div className="max-w-2xl">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">Rewards</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          This campaign does not offer reward tiers. Backing it funds the work in the plan, and the
          stages are what the money is released against.
        </p>
      </div>
    );
  }

  // Cheapest first: the order a backer reads a price list in.
  const tiers = [...campaign.rewards].sort(
    (a, b) => parseDecimal(a.amount) - parseDecimal(b.amount)
  );

  return (
    <div className="space-y-5">
      <div className="max-w-[68ch]">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">Rewards</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          What the creator is offering at each pledge level. These are separate from the delivery
          stages: a reward does not release money, and a stage does not depend on one.
        </p>
      </div>

      <ul className="space-y-4">
        {tiers.map((tier) => (
          <li key={tier.id}>
            <TierCard tier={tier} />
          </li>
        ))}
      </ul>

      <p className="max-w-[68ch] text-xs leading-relaxed text-ink-muted">
        A delivery date on a tier is the creator&rsquo;s estimate, not a guarantee, and it is not what
        the stage review is for. Backers review what a <em>stage</em> delivered; that is what decides
        whether its share of the money is released.
      </p>
    </div>
  );
}

function TierCard({ tier }: { tier: RewardTier }) {
  const limited = tier.limitedQuantity !== null;
  const left = limited ? Math.max(0, tier.limitedQuantity! - tier.claimed) : null;
  const goneAll = limited && left === 0;

  return (
    <Card className={goneAll ? 'p-5 opacity-70' : 'p-5'}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-display text-base font-bold tracking-tight text-ink">{tier.title}</h3>
        <p className="font-display text-lg font-bold tracking-tight text-accent-700 tabular-nums">
          <Amount value={tier.amount} currency="USD" />
        </p>
      </div>

      <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-ink-muted">{tier.description}</p>

      {tier.items.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-border pt-3">
          {tier.items.map((item) => (
            <li key={item.label} className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-ink">{item.label}</span>
              <span className="shrink-0 text-xs text-ink-muted tabular-nums">
                ×<Count value={item.quantity} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {limited && (
        <div className="mt-4">
          <Meter
            ratio={tier.limitedQuantity! > 0 ? tier.claimed / tier.limitedQuantity! : 0}
            size="sm"
            tone={goneAll ? 'neutral' : 'accent'}
            srLabel="of this tier claimed"
            label={
              <>
                <span className="text-xs font-medium text-ink">
                  {goneAll ? 'All gone' : `${left} left`}
                </span>
                <span className="text-xs text-ink-muted tabular-nums">
                  of <Count value={tier.limitedQuantity!} />
                </span>
              </>
            }
          />
        </div>
      )}

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3 text-xs">
        <div>
          <dt className="text-ink-muted">Estimated delivery</dt>
          <dd className="mt-0.5 font-medium text-ink">{formatMonth(tier.estimatedDelivery)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Posting</dt>
          <dd className="mt-0.5 font-medium text-ink">{SHIPPING_LABEL[tier.shipping]}</dd>
        </div>
        {tier.claimed > 0 && (
          <div>
            <dt className="text-ink-muted">Backers</dt>
            <dd className="mt-0.5 font-medium text-ink tabular-nums">
              <Count value={tier.claimed} /> {pluralise(tier.claimed, 'backer')}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4">
        <Pill>{goneAll ? 'No longer available' : 'Available when funding opens'}</Pill>
      </div>
    </Card>
  );
}

/** "March 2027" — a day-precise promise a year out is not credible, so tiers state the month. */
function formatMonth(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'Not set';
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
