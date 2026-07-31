import Link from 'next/link';
import { Amount, Count } from '@/components/ui/amount';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { daysUntil, parseDecimal, pluralise } from '@/lib/format';
import type { CampaignListItem } from '@/lib/campaigns/types';

/**
 * Campaign card for the list.
 *
 * Same reading order as the idea card, one substitution: raised against goal instead of progress toward a
 * threshold, and a delivery line instead of estimated interest, because delivery record is what a backer is
 * actually judging once money is involved.
 *
 * Failed campaigns stay in the list and say so. Hiding them would undercut the only claim the product
 * makes.
 */
export function CampaignCard({ campaign }: { campaign: CampaignListItem }) {
  const raised = parseDecimal(campaign.totalRaised);
  const target = parseDecimal(campaign.targetAmount);
  const daysLeft = daysUntil(campaign.deadline);
  const { released, total, underReview, failed } = campaign.milestoneSummary;

  return (
    <Card className="flex h-full flex-col p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* Same type hierarchy as IdeaCard: only the title and the money figure carry weight, and
          everything else is 10–11px supporting detail. The two cards share a grid, so a mismatched
          scale between them would read as two different products. */}
      <div className="flex items-center gap-1.5">
        <Avatar name={campaign.creator.displayName} src={campaign.creator.avatarUrl} size={20} />
        <span className="truncate text-[11px] leading-none text-ink-muted">
          {campaign.creator.displayName}
        </span>
        {campaign.region && (
          <span className="shrink-0 text-[11px] leading-none text-ink-muted">· {campaign.region}</span>
        )}
      </div>

      <h3 className="mt-2 font-display text-[15px] font-bold leading-[1.25] tracking-tight text-ink">
        <Link
          href={`/campaigns/${campaign.slug}`}
          className="line-clamp-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 hover:underline"
        >
          {campaign.title}
        </Link>
      </h3>

      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
        {campaign.summary}
      </p>

      <div className="mt-3.5 border-t border-border pt-2.5">
        <Meter
          ratio={target > 0 ? raised / target : 0}
          cap={false}
          size="sm"
          tone={campaign.status === 'FAILED' ? 'danger' : 'accent'}
          srLabel="of the funding goal"
          label={
            <>
              <span className="text-sm font-semibold text-ink tabular-nums">
                <Amount value={raised} currency="USD" />
              </span>
              <span className="text-[10px] text-ink-muted">
                of <Amount value={target} currency="USD" /> goal
              </span>
            </>
          }
        />
      </div>

      <p className="mt-2 text-[11px] leading-tight text-ink-muted">
        <Count value={campaign.backerCount} /> {pluralise(campaign.backerCount, 'backer')}
        {campaign.status === 'ACTIVE' && (
          <>
            {' · '}
            <Count value={daysLeft} /> {pluralise(daysLeft, 'day')} left
          </>
        )}
        {' · '}
        <span className="tabular-nums">
          {released} of {total} stages delivered
        </span>
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1 pt-3">
        {campaign.status === 'FAILED' || failed > 0 ? (
          <Pill tone="danger" size="xs">
            Stage not delivered
          </Pill>
        ) : campaign.status === 'COMPLETED' ? (
          <Pill tone="accent" size="xs" marker={<span aria-hidden="true">✓</span>}>
            All stages delivered
          </Pill>
        ) : underReview > 0 ? (
          <Pill tone="accent" size="xs" marker={<span aria-hidden="true">◔</span>}>
            A stage is under review
          </Pill>
        ) : (
          <Pill size="xs">Raising now</Pill>
        )}
      </div>
    </Card>
  );
}
