'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Amount, Count } from '@/components/ui/amount';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Meter } from '@/components/ui/meter';
import { Pill } from '@/components/ui/pill';
import { Tooltip } from '@/components/ui/tooltip';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { cn } from '@/lib/utils';
import { buildGateProgress, validationDaysLeft } from '@/lib/ideas/gate';
import { formatPercent, pluralise } from '@/lib/format';
import type { FeedItem } from '@/lib/feed/types';
import { IdeaCover } from './idea-cover';
import { ReasonChip } from './reason-chip';

/**
 * The featured slot, as a full-width carousel.
 *
 * It replaced a two-column hero (one large card beside a 2×2 grid), which never balanced: the tall
 * column set the height and the featured card was left with a few hundred pixels of void beneath it. One
 * full-width slide has one job, fills its own row, and gives several ideas the featured slot instead of
 * one.
 *
 * The slide is **horizontal** at `sm` and up — cover band on the left, everything else on the right —
 * so the width goes into content rather than into a taller placeholder cover.
 *
 * Scrolling is a native snap container: it works with a trackpad, a touch swipe, and the arrow buttons,
 * and it needs no JavaScript to be usable. Nothing auto-advances; an auto-playing carousel is banned
 * (conventions §9.4) and would move the page under a reader mid-sentence.
 */
export function FeaturedCarousel({ items }: { items: FeedItem[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const slides = items.slice(0, 6);

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(i, track.children.length - 1));
    const child = track.children[clamped] as HTMLElement | undefined;
    if (!child) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  // Track which slide is in view so the dots and the arrow disabled states stay honest when the reader
  // swipes rather than clicks.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const width = track.clientWidth || 1;
      setIndex(Math.round(track.scrollLeft / width));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  if (slides.length === 0) return null;

  return (
    <section aria-roledescription="carousel" aria-label="Featured ideas">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="font-display text-base font-bold tracking-tight text-ink sm:text-lg">
          Featured ideas
        </h2>

        {slides.length > 1 && (
          <div className="flex items-center gap-1.5">
            <ArrowButton
              direction="previous"
              disabled={index <= 0}
              onClick={() => scrollTo(index - 1)}
            />
            <ArrowButton
              direction="next"
              disabled={index >= slides.length - 1}
              onClick={() => scrollTo(index + 1)}
            />
          </div>
        )}
      </div>

      <ul
        ref={trackRef}
        className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((item, i) => (
          <li
            key={item.id}
            className="w-full shrink-0 snap-start"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            <FeaturedSlide item={item} />
          </li>
        ))}
      </ul>

      {slides.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Show featured idea ${i + 1}: ${item.title}`}
              aria-current={i === index}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
                i === index ? 'w-6 bg-accent-500' : 'w-1.5 bg-ink/20 hover:bg-ink/40'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FeaturedSlide({ item }: { item: FeedItem }) {
  const gate = buildGateProgress(item);
  const daysLeft = validationDaysLeft(item.validatingSince);
  const thresholdMet = item.status === 'THRESHOLD_MET';

  return (
    <Card tone={item.promoted ? 'promoted' : 'default'} className="h-full overflow-hidden">
      <div className="grid sm:grid-cols-[minmax(0,15rem)_1fr] lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* The cover is a side panel here, not a banner: it fills the column's height instead of
            adding to it, so an image-less idea costs no vertical space. */}
        <div className="relative sm:h-full">
          <IdeaCover
            id={item.id}
            title={item.title}
            category={item.category}
            topics={item.topics}
            src={item.coverImageUrl}
            size="featured"
            className="sm:h-full"
          />
        </div>

        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
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

          <h3 className="font-display text-lg font-bold leading-[1.2] tracking-tight text-ink sm:text-xl">
            <Link
              href={`/ideas/${item.slug}`}
              className="line-clamp-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 hover:underline"
            >
              {item.title}
            </Link>
          </h3>

          <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-muted">{item.problem}</p>

          <Meter
            ratio={gate.overallPct}
            size="sm"
            srLabel="to the validation threshold"
            className="mt-0.5"
          />

          <div className="flex items-baseline justify-between gap-3">
            <Tooltip
              label="About this figure"
              content={
                thresholdMet
                  ? 'Every validation threshold has been met, so this idea can be turned into a campaign.'
                  : `${gate.binding.label} is the threshold holding this back, at ${formatPercent(gate.binding.pct)}.`
              }
            >
              <span className="text-sm font-semibold text-accent-700 tabular-nums">
                {thresholdMet ? 'Threshold met' : `${formatPercent(gate.overallPct)} to threshold`}
              </span>
            </Tooltip>
            <span className="text-sm text-ink">
              <Amount value={item.weightedPrePledgeTotal} currency="USD" className="font-semibold" />
              <span className="ml-1 text-[10px] text-ink-muted">estimated interest</span>
            </span>
          </div>

          <p className="text-[11px] leading-tight text-ink-muted">
            <Count value={item.supporterCount} /> {pluralise(item.supporterCount, 'supporter')}
            {daysLeft !== null && !thresholdMet && (
              <>
                {' · '}
                <Count value={daysLeft} /> {pluralise(daysLeft, 'day')} left
              </>
            )}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-1 pt-1.5">
            <ReasonChip reason={item.reason} size="xs" />
            {thresholdMet && (
              <Pill tone="accent" size="xs">
                Ready to raise
              </Pill>
            )}
            {item.region && <Pill size="xs">{item.region}</Pill>}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'previous' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction === 'next' ? 'Next' : 'Previous'} featured idea`}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-accent-500/50 hover:text-accent-700 disabled:opacity-35 disabled:hover:border-border disabled:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {direction === 'next' ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
      </svg>
    </button>
  );
}
