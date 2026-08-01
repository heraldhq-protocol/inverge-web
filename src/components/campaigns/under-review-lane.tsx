import Link from 'next/link';
import { Amount } from '@/components/ui/amount';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { objectionDaysLeft } from '@/lib/campaigns/milestone-state';
import { distributableAmount } from '@/lib/campaigns/campaign-stats';
import { parseDecimal, pluralise } from '@/lib/format';
import type { CampaignListItem, Milestone } from '@/lib/campaigns/types';

export type UnderReviewItem = { campaign: CampaignListItem; milestone: Milestone };

/**
 * Stages whose objection window is open right now, across every campaign.
 *
 * This module has no analogue anywhere in the reference, because on Kickstarter the money leaves at
 * funding close and there is nothing left to watch (teardown §9.5). It leads the catalogue for that
 * reason: it is the only place a reader can watch staged escrow being audited in public, and it is
 * the argument the rest of the page is making.
 *
 * Tone is the design. Days, not a ticking clock; no red, no "urgent"; the amount at stake stated
 * plainly, because "30% of the raise" is not a number anyone can act on
 * (campaign-brief.md §9 rule 7).
 */
export function UnderReviewLane({ items }: { items: UnderReviewItem[] }) {
  return (
    <section aria-labelledby="under-review-heading">
      <div className="mb-3">
        <h2
          id="under-review-heading"
          className="font-display text-base font-bold tracking-tight text-ink sm:text-lg"
        >
          Stages under review right now
        </h2>
        <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-ink-muted">
          Backers are reviewing what was delivered on these stages. Nothing is released until the
          window closes.
        </p>
      </div>

      {items.length === 0 ? (
        <Card tone="quiet" className="px-5 py-6">
          <p className="text-sm leading-relaxed text-ink-muted">
            No stage is under review this week. When one is, it appears here while backers review it.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(({ campaign, milestone }) => (
            <li key={`${campaign.id}-${milestone.id}`} className="h-full">
              <UnderReviewCard campaign={campaign} milestone={milestone} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function UnderReviewCard({ campaign, milestone }: UnderReviewItem) {
  const claim = milestone.claim;
  if (!claim) return null;

  const daysLeft = objectionDaysLeft(milestone) ?? 0;
  // Stages divide the raise less the upfront, which is a share of the goal (campaign-stats.ts).
  const atStake = (parseDecimal(milestone.tranchePct) / 100) * distributableAmount(campaign);
  const weight = parseDecimal(claim.objectionWeightPct);
  const threshold = parseDecimal(claim.objectionThresholdPct);

  return (
    <Card className="flex h-full flex-col border-accent-500/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <Pill tone="accent" size="xs" marker={<span aria-hidden="true">◔</span>}>
          Under review
        </Pill>
        <span className="text-[11px] font-semibold text-ink tabular-nums">
          {daysLeft} {pluralise(daysLeft, 'day')} left
        </span>
      </div>

      <p className="mt-2.5 text-[11px] leading-none text-ink-muted">{campaign.title}</p>

      <h3 className="mt-1 font-display text-[15px] font-bold leading-[1.25] tracking-tight text-ink">
        <Link
          href={`/campaigns/${campaign.slug}`}
          className="line-clamp-2 rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          Stage {milestone.index + 1}: {milestone.title}
        </Link>
      </h3>

      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
        {milestone.deliverable}
      </p>

      <div className="mt-auto space-y-2 pt-3.5">
        <Meter
          ratio={threshold > 0 ? weight / threshold : 0}
          tone="neutral"
          size="sm"
          srLabel="of the objections needed to stop this stage"
          label={
            <>
              <span className="text-[10px] text-ink-muted">Objections so far</span>
              <span className="text-[10px] text-ink-muted tabular-nums">
                {weight}% of {threshold}%
              </span>
            </>
          }
        />
        <p className="text-[11px] leading-tight text-ink-muted">
          <span className="font-semibold text-ink tabular-nums">
            <Amount value={atStake} currency="USD" />
          </span>{' '}
          releases if the window closes without enough objections
        </p>
      </div>
    </Card>
  );
}
