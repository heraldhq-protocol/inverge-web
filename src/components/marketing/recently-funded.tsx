'use client';

import { useEffect, useState } from 'react';
import { Amount } from '@/components/ui/amount';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';

/**
 * Placeholder data — swap for `GET /campaigns?sort=recently_funded&limit=3` when the endpoint
 * lands. Shapes are deliberately close to the API contract so the swap is mechanical.
 */
const RECENT = [
  {
    name: 'Zowasel Eats',
    blurb: 'School food ordering platform in Ibadan',
    amount: 4_200_000,
    milestone: 'Milestone 1 funded',
    progress: 100,
  },
  {
    name: 'CampusKonekt',
    blurb: 'Student marketplace across Lagos campuses',
    amount: 3_600_000,
    milestone: 'Milestone 2 funded',
    progress: 72,
  },
  {
    name: 'Kudi Logistics',
    blurb: 'Last-mile delivery for Aba traders',
    amount: 2_850_000,
    milestone: 'Milestone 1 funded',
    progress: 45,
  },
] as const;

const ROTATE_MS = 4500;

export function RecentlyFunded() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    // Auto-rotation is motion. Users who asked for less of it get a static top card and the
    // dots as the only way to move between projects.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(
      () => setActive((i) => (i + 1) % RECENT.length),
      ROTATE_MS
    );
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      className="group relative"
      // Pausable per WCAG 2.2 SC 2.2.2 — hovering to read a card must not have it swap away.
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Every card occupies the same grid cell, so the stack is as tall as its tallest member
          and switching cannot shift layout. No fixed height to keep in sync with the copy. */}
      <div className="grid">
        {RECENT.map((project, i) => {
          const depth = (i - active + RECENT.length) % RECENT.length;
          const isFront = depth === 0;

          return (
            <div
              key={project.name}
              aria-hidden={!isFront}
              className={cn(
                '[grid-area:1/1] border border-border/80 bg-surface p-5 sm:p-6',
                // Explicit property list rather than transition-all: only these change,
                // and transitioning layout properties here would fight the grid stacking.
                'origin-bottom transition-[transform,opacity,box-shadow,border-color] duration-500 ease-out',
                // origin-bottom keeps the bottom edge anchored, so the peek below each card is
                // exactly its translate distance instead of translate minus the scale shrink.
                depth === 0 &&
                'z-30 translate-y-0 scale-100 opacity-100 shadow-xl border-accent-500/20 hover:border-accent-500/40 hover:shadow-accent-500/5',
                depth === 1 && 'z-20 translate-y-4 scale-[0.97] opacity-75 shadow-lg',
                depth >= 2 && 'z-10 translate-y-8 scale-[0.94] opacity-45 shadow-md',
                // Hover already pauses rotation; the lift makes that state legible.
                isFront && 'group-hover:-translate-y-1'
              )}
            >
              <Eyebrow className="mb-2">RECENTLY FUNDED</Eyebrow>

              <div className="mt-1 flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
                    {project.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted sm:text-sm">{project.blurb}</p>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-base font-bold text-ink sm:text-lg">
                    <Amount value={project.amount} currency="NGN" />
                  </div>
                  <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-accent-700">
                    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                      <span
                        className="absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75"
                        data-live-ring="true"
                      />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
                    </span>
                    {project.milestone}
                  </span>
                </div>
              </div>

              <div
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${project.name} funding progress`}
                className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-accent-100"
              >
                {/* Collapsed unless this card is front, so the bar fills as the card arrives.
                    On first paint the front card renders at its final width with nothing to
                    transition from — the fill only ever plays on a switch, never on load. */}
                <div
                  className="relative h-full overflow-hidden rounded-full bg-accent-500 transition-[width] delay-150 duration-700 ease-out"
                  style={{ width: isFront ? `${project.progress}%` : '0%' }}
                >
                  {isFront && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                      data-shimmer="true"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlaid rather than stacked below, so the peeking cards keep their breathing room.
          Offsets are the card padding less half the 24px hit area, so the dots optically
          align with the RECENTLY FUNDED label rather than sitting proud of it. */}
      <div className="absolute right-4 top-4 z-40 flex items-center gap-1 sm:right-5 sm:top-5">
        {RECENT.map((project, i) => (
          <button
            key={project.name}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${project.name}`}
            aria-current={i === active}
            // 24px hit area per WCAG 2.2 SC 2.5.8, with a smaller visual dot inside.
            className="grid h-6 w-6 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <span
              className={cn(
                'block h-1.5 rounded-full transition-all duration-300',
                i === active ? 'w-4 bg-accent-500' : 'w-1.5 bg-ink/20'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
