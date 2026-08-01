import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Amount, Count } from '@/components/ui/amount';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Cover } from '@/components/ui/cover';
import { CoverMeter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { fundingProgress, outcomeLabel } from '@/lib/campaigns/campaign-stats';
import { daysUntil, formatDateShort, pluralise } from '@/lib/format';
import type { CampaignListItem } from '@/lib/campaigns/types';

export type CampaignCardSize = 'featured' | 'grid' | 'lane';

/**
 * The campaign card.
 *
 * Element order is `IdeaCard`'s, exactly: cover with the funding meter welded to its bottom edge,
 * creator, title, summary, the two comparable figures, one metadata line, status. The two cards
 * appear in the same grids, so a mismatch in order or type scale would read as two different
 * products (ideas-campaigns-brief §5.1a).
 *
 * One substitution: an idea shows estimated interest against a validation threshold, a campaign shows
 * money raised against a goal, because on a campaign the money has actually moved.
 *
 * **Over-goal is a good state and is drawn as one.** The meter fills, the figure says how far past
 * the goal it went, and a quiet pill names it. What it does not do is celebrate: the reference turns
 * 1,952% into a starburst, and an overfunding leaderboard is a growth mechanic, not information
 * (campaign-brief.md §9 rule 4).
 */
export function CampaignCard({
  campaign,
  size = 'grid',
}: {
  campaign: CampaignListItem;
  size?: CampaignCardSize;
}) {
  const funding = fundingProgress(campaign);
  const daysLeft = daysUntil(campaign.deadline);
  const live = campaign.status === 'ACTIVE';
  const closingSoon = live && daysLeft <= 7;
  const failed = campaign.status === 'FAILED';
  const { released, total, underReview } = campaign.milestoneSummary;
  const featured = size === 'featured';

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative">
        {/* 16:9, the frame the pitch video is already in, so the card thumbnail and the player on the
            detail page are the same crop rather than two different ones. */}
        <Cover
          id={campaign.id}
          title={campaign.title}
          category={campaign.category}
          topics={campaign.topics}
          // Cover art first: a creator who chose a still for the card chose it for the card. The
          // video's poster frame is the fallback, and the deterministic band is the fallback to that.
          src={campaign.coverImageUrl ?? campaign.videoPosterUrl}
          size={size}
          ratio="thumbnail"
        />
        {/* The meter is welded to the thumbnail's bottom edge, where it reads as a waterline rather
            than as a chart (teardown §3). Uncapped fill would overflow the track, so the bar tops out
            and the real figure is printed below. */}
        <CoverMeter
          ratio={funding.ratio}
          tone={failed ? 'danger' : 'accent'}
          srLabel="of the funding goal"
        />
        {/* At most one overlay on a thumbnail (teardown §7). This is it: every campaign has a pitch
            video, so the marker tells a reader what opening the card gets them. */}
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-semibold text-white">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-2.5 w-2.5 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
          Video
        </span>
      </div>

      <div className={cn('flex flex-1 flex-col', featured ? 'gap-2 p-4' : 'gap-1.5 p-3.5')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar name={campaign.creator.displayName} src={campaign.creator.avatarUrl} size={20} />
            <span className="truncate text-[11px] leading-none text-ink-muted">
              {campaign.creator.displayName}
            </span>
            {campaign.region && (
              <span className="shrink-0 text-[11px] leading-none text-ink-muted">
                · {campaign.region}
              </span>
            )}
          </div>
          {campaign.creator.identityVerified && (
            <VerifiedBadge
              tier={campaign.creator.verificationTier}
              showText={false}
              className="gap-0.5 px-1.5 py-px text-[10px]"
            />
          )}
        </div>

        <h3
          className={cn(
            'font-display font-bold leading-[1.25] tracking-tight text-ink',
            featured ? 'text-[17px]' : 'text-[15px]'
          )}
        >
          <Link
            href={`/campaigns/${campaign.slug}`}
            className="line-clamp-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 group-hover:underline"
          >
            {campaign.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-muted">{campaign.summary}</p>

        {/* The two figures a reader compares across cards, on one row: money left, progress right.
            Both 14px, both tabular, so the eye can run down a column without re-anchoring. */}
        <div className="mt-0.5 flex items-baseline justify-between gap-3 border-t border-border pt-2">
          <span>
            <span className="text-sm font-semibold text-ink tabular-nums">
              <Amount value={funding.raised} currency="USD" />
            </span>
            <span className="ml-1 text-[10px] text-ink-muted">
              of <Amount value={funding.target} currency="USD" />
            </span>
          </span>
          <span
            className={cn(
              'text-sm font-semibold tabular-nums',
              funding.over ? 'text-accent-700' : 'text-ink'
            )}
          >
            {funding.pct}%
            <span className="ml-1 text-[10px] font-medium text-ink-muted">of goal</span>
          </span>
        </div>

        {/* Deadline is its own line and always present. A campaign a reader cannot back because it
            closed last month should say so before they read the pitch. */}
        <p className="text-[11px] leading-tight text-ink-muted">
          {live ? (
            <span className={cn(closingSoon && 'font-semibold text-ink')}>
              <Count value={daysLeft} /> {pluralise(daysLeft, 'day')} left
              {closingSoon && ' to back this'}
            </span>
          ) : (
            <span>Closed {formatDateShort(campaign.deadline)}</span>
          )}
          {' · '}
          <Count value={campaign.backerCount} /> {pluralise(campaign.backerCount, 'backer')}
          {total > 0 && (
            <>
              {' · '}
              <span className="tabular-nums">
                {released} of {total} stages delivered
              </span>
            </>
          )}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1 pt-2.5">
          {failed ? (
            <Pill tone="danger" size="xs" marker={<span aria-hidden="true">×</span>}>
              Stage not delivered
            </Pill>
          ) : campaign.status === 'COMPLETED' ? (
            <Pill tone="accent" size="xs" marker={<span aria-hidden="true">✓</span>}>
              {outcomeLabel(campaign.milestoneSummary, campaign.status)}
            </Pill>
          ) : underReview > 0 ? (
            <Pill tone="accent" size="xs" marker={<span aria-hidden="true">◔</span>}>
              A stage is under review
            </Pill>
          ) : (
            <Pill size="xs">{outcomeLabel(campaign.milestoneSummary, campaign.status)}</Pill>
          )}

          {funding.over && (
            <Pill tone="accent" size="xs" marker={<span aria-hidden="true">↑</span>}>
              <Amount value={funding.surplus} currency="USD" /> past goal
            </Pill>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Matches the card's real dimensions so nothing shifts when data lands (conventions §7). */
export function CampaignCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="h-20 w-full bg-ink/8" />
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="h-3 w-1/2 rounded bg-ink/8" />
        <div className="h-4 w-4/5 rounded bg-ink/8" />
        <div className="h-3 w-full rounded bg-ink/8" />
        <div className="mt-1 h-4 w-full rounded bg-ink/8" />
        <div className="h-3 w-3/4 rounded bg-ink/8" />
        <div className="mt-auto h-4 w-28 rounded-full bg-ink/8" />
      </div>
    </Card>
  );
}
