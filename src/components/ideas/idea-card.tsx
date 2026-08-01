import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Amount, Count } from '@/components/ui/amount';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { CoverMeter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { buildGateProgress, validationDaysLeft } from '@/lib/ideas/gate';
import { formatPercent, pluralise } from '@/lib/format';
import type { FeedItem } from '@/lib/feed/types';
import { Cover } from '@/components/ui/cover';
import { ReasonChip } from './reason-chip';

export type IdeaCardSize = 'featured' | 'grid' | 'lane';

/**
 * The one card, at three densities (teardown §3). Element order is identical at every size so a reader
 * learns it once: cover with the meter welded to its bottom edge, then creator, then title, then one
 * metadata line, then estimated interest, then the reason chip.
 *
 * **Type hierarchy.** A card is scanned, not read, so only two things are allowed to carry weight: the
 * title, and the two numbers a reader is actually comparing across cards (progress and estimated
 * interest). Everything else is 10–11px supporting detail. When every line sits at 12–14px the card has
 * no hierarchy at all and nine of them read as a wall — which is the failure mode the app kit warns
 * about (§3.1: oversized type is the number-one tell that a product screen is really a landing page).
 *
 * The scale, deliberately narrow:
 *   title            15px grid / 17px featured, bold, the only display face on the card
 *   the two figures  14px semibold, tabular
 *   problem line     13px, featured only
 *   creator, meta    11px
 *   pills, badges    10px
 *
 * Money: every figure passes `currency="USD"` explicitly. `askAmount` and `weightedPrePledgeTotal` are
 * USD and <Amount> defaults to NGN, so an implicit call renders a dollar figure with a naira symbol
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
      className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative">
        <Cover
          id={item.id}
          title={item.title}
          category={item.category}
          topics={item.topics}
          src={item.coverImageUrl}
          size={size}
        />
        <CoverMeter ratio={gate.overallPct} srLabel="to validation threshold" />
      </div>

      <div className={cn('flex flex-1 flex-col', featured ? 'gap-2 p-4' : 'gap-1.5 p-3.5')}>
        {/* The paid label is the first thing in the body, above the creator and well away from the
            figures: visible, non-dismissable, and never adjacent to a validation number (FR-206a). It
            sits here rather than in a header strip above the cover so that covers line up across a row —
            an extra strip on one card pushed its cover down and left the row visibly uneven. */}
        {item.promoted && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Pill tone="promoted" size="xs" marker={<span aria-hidden="true">◆</span>}>
              Promoted
            </Pill>
            <span className="text-[10px] leading-tight text-ink-muted">
              Paid placement. It does not change the numbers.
            </span>
          </div>
        )}

        {/* Attribution: supporting detail, so it sits at the bottom of the scale. */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar name={item.creator?.displayName ?? null} src={item.creator?.avatarUrl} size={20} />
            <span className="truncate text-[11px] leading-none text-ink-muted">
              {item.creator?.displayName ?? 'Creator'}
            </span>
          </div>
          {item.creator?.identityVerified && (
            <VerifiedBadge
              tier={item.creator.verificationTier}
              showText={false}
              className="gap-0.5 px-1.5 py-px text-[10px]"
            />
          )}
        </div>

        {/* One of the two things allowed to carry weight. */}
        <h3
          className={cn(
            'font-display font-bold leading-[1.25] tracking-tight text-ink',
            featured ? 'text-[17px]' : 'text-[15px]'
          )}
        >
          <Link
            href={`/ideas/${item.slug}`}
            className="line-clamp-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 group-hover:underline"
          >
            {item.title}
          </Link>
        </h3>

        {featured && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-muted">{item.problem}</p>
        )}

        {/* The two comparable numbers, on one row: progress left, interest right. Both 14px, both
            tabular, so the eye can run down a column of cards without re-anchoring. */}
        <div className="mt-0.5 flex items-baseline justify-between gap-3 border-t border-border pt-2">
          <Tooltip
            label="About this figure"
            content={
              thresholdMet
                ? 'Every validation threshold has been met, so this idea can be turned into a campaign.'
                : `${gate.binding.label} is the threshold holding this back, at ${formatPercent(gate.binding.pct)}. An idea has to clear four of them, and the meter shows whichever is furthest behind.`
            }
          >
            <span className="text-sm font-semibold text-accent-700 tabular-nums">
              {thresholdMet ? 'Threshold met' : formatPercent(gate.overallPct)}
            </span>
          </Tooltip>

          <span className="flex items-baseline gap-1">
            <Amount
              value={item.weightedPrePledgeTotal}
              currency="USD"
              className="text-sm font-semibold text-ink"
            />
            <InfoTooltip
              label="About estimated interest"
              content="What supporters said they would put in, weighted by how verified each of them is. Nothing has been charged and no money moves at this stage."
            />
          </span>
        </div>

        {/* Labels for those figures, and the rest of the metadata. All 10–11px. */}
        <div className="flex items-baseline justify-between gap-3 text-[10px] leading-tight text-ink-muted">
          <span>{thresholdMet ? 'ready to raise' : 'to threshold'}</span>
          <span>estimated interest</span>
        </div>

        <p className="text-[11px] leading-tight text-ink-muted">
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

        {/* `mt-auto` pins the chips to the bottom so every card in a row ends on the same line, which
            matters most for the promoted card: its extra header row makes it taller than its
            neighbours, and without this the whole row goes ragged. */}
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-2">
          <ReasonChip reason={item.reason} size="xs" />
          {thresholdMet && (
            <Pill tone="accent" size="xs">
              Ready to raise
            </Pill>
          )}
          {item.discoverabilityTier === 'FEATURED' && !item.promoted && <Pill size="xs">Featured</Pill>}
          {featured && item.region && <Pill size="xs">{item.region}</Pill>}
        </div>
      </div>
    </Card>
  );
}

/** Matches the card's final dimensions so the grid does not shift when data arrives. */
export function IdeaCardSkeleton({ size = 'grid' }: { size?: IdeaCardSize }) {
  const featured = size === 'featured';
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="aspect-[3/2] w-full bg-ink/8" />
      <div className={cn('flex flex-1 flex-col gap-2', featured ? 'p-4' : 'p-3.5')}>
        <div className="h-3 w-1/2 rounded bg-ink/8" />
        <div className="h-4 w-4/5 rounded bg-ink/8" />
        <div className="mt-1 h-4 w-full rounded bg-ink/8" />
        <div className="h-3 w-2/3 rounded bg-ink/8" />
        <div className="mt-auto h-5 w-24 rounded-full bg-ink/8" />
      </div>
    </Card>
  );
}
