import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Amount, Count } from '@/components/ui/amount';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { CoverMeter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { buildGateProgress, validationDaysLeft } from '@/lib/ideas/gate';
import { formatPercent, pluralise } from '@/lib/format';
import type { FeedItem } from '@/lib/feed/types';
import { IdeaCover } from './idea-cover';
import { ReasonChip } from './reason-chip';

export type IdeaCardSize = 'featured' | 'grid' | 'lane';

/**
 * The one card, at three densities (teardown §3). Element order is identical at every size so a
 * reader learns it once: cover with the meter welded to its bottom edge, then creator, then title,
 * then one metadata line, then the reason chip. Description and tags are the featured density's way of
 * earning its size — the title only steps up two points.
 *
 * Switches on `objectType` so campaign cards drop into the same grid later without a rewrite.
 *
 * Money: every figure passes `currency="USD"` explicitly. `askAmount` and `weightedPrePledgeTotal` are
 * USD, and <Amount> defaults to NGN, so an implicit call renders a dollar figure with a naira symbol
 * (brief §7.4).
 */
export function IdeaCard({ item, size = 'grid' }: { item: FeedItem; size?: IdeaCardSize }) {
  const gate = buildGateProgress(item);
  const daysLeft = validationDaysLeft(item.validatingSince);
  const thresholdMet = item.status === 'THRESHOLD_MET';
  const endingSoon = !thresholdMet && daysLeft !== null && daysLeft <= 7;
  const featured = size === 'featured';

  return (
    <Card
      tone={item.promoted ? 'promoted' : 'default'}
      className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lift motion-reduce:transition-none"
    >
      {/* The paid label sits in the card's own header row, above the cover: never over the image and
          never next to a validation number, so it cannot be confused with one (FR-206a). */}
      {item.promoted && (
        <div className="flex items-center justify-between gap-2 border-b border-accent-500/25 px-3 py-2">
          <Pill tone="promoted" marker={<span aria-hidden="true">◆</span>}>
            Promoted
          </Pill>
          <span className="text-[11px] leading-tight text-ink-muted">
            Paid placement. It does not change the numbers below.
          </span>
        </div>
      )}

      <div className="relative">
        <IdeaCover
          id={item.id}
          title={item.title}
          category={item.category}
          src={null}
          size={size}
        />
        <CoverMeter ratio={gate.overallPct} srLabel="to validation threshold" />
      </div>

      <div className={cn('flex flex-1 flex-col gap-2', featured ? 'p-5' : 'p-4')}>
        <div className="flex items-center gap-2">
          <Avatar name={item.creator?.displayName ?? null} src={item.creator?.avatarUrl} size={20} />
          <span className="truncate text-xs text-ink-muted">
            {item.creator?.displayName ?? 'Creator'}
          </span>
          {item.creator?.identityVerified && (
            <span className="shrink-0 text-[11px] font-semibold text-accent-700">
              Verified creator
            </span>
          )}
        </div>

        <h3 className={cn('font-display font-bold leading-snug tracking-tight text-ink', featured ? 'text-lg' : 'text-base')}>
          <Link
            href={`/ideas/${item.slug}`}
            className="line-clamp-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 group-hover:underline"
          >
            {item.title}
          </Link>
        </h3>

        {/* One metadata line doing three jobs: progress, supporters, time. Tabular so a column of
            cards does not jitter. */}
        <p className="text-xs text-ink-muted">
          <span className="font-semibold text-accent-700 tabular-nums">
            {thresholdMet ? 'Threshold met' : `${formatPercent(gate.overallPct)} to threshold`}
          </span>
          {' · '}
          <Count value={item.supporterCount} /> {pluralise(item.supporterCount, 'supporter')}
          {daysLeft !== null && !thresholdMet && (
            <>
              {' · '}
              <span className={endingSoon ? 'font-semibold text-ink' : undefined}>
                <Count value={daysLeft} /> {pluralise(daysLeft, 'day')} left
              </span>
            </>
          )}
        </p>

        {featured && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{item.problem}</p>
        )}

        {/* Estimated interest is the only permitted label for the weighted figure, site-wide. */}
        <p className="text-sm text-ink">
          <span className="text-ink-muted">Estimated interest </span>
          <Amount value={item.weightedPrePledgeTotal} currency="USD" className="font-semibold" />
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          <ReasonChip reason={item.reason} />
          {thresholdMet && <Pill tone="accent">Ready to raise</Pill>}
          {item.discoverabilityTier === 'FEATURED' && !item.promoted && <Pill>Featured</Pill>}
          {featured && item.region && <Pill>{item.region}</Pill>}
        </div>
      </div>
    </Card>
  );
}

/** Matches the card's final dimensions so the grid does not shift when data arrives. */
export function IdeaCardSkeleton({ size = 'grid' }: { size?: IdeaCardSize }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="aspect-[3/2] w-full bg-ink/8" />
      <div className={cn('flex flex-1 flex-col gap-3', size === 'featured' ? 'p-5' : 'p-4')}>
        <div className="h-4 w-1/2 rounded bg-ink/8" />
        <div className="h-5 w-4/5 rounded bg-ink/8" />
        <div className="h-3 w-2/3 rounded bg-ink/8" />
        <div className="mt-auto h-6 w-28 rounded-full bg-ink/8" />
      </div>
    </Card>
  );
}
