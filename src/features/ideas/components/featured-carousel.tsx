"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";

import { IdeaDiscoveryCard } from "@/features/ideas/components/idea-discovery-card";
import type { DiscoveryIdea } from "@/features/ideas/types";

/** Which slide the track is actually resting on, including after a manual swipe. */
function restingIndex(track: HTMLElement): number {
  let closest = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < track.children.length; index += 1) {
    const slide = track.children.item(index);
    if (!(slide instanceof HTMLElement)) continue;

    const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = index;
    }
  }

  return closest;
}

/**
 * The featured slot, as a full-width carousel.
 *
 * A single slide per view replaced a hero that paired one tall card with a grid
 * beside it: the tall column set the row height, so the featured card carried a
 * few hundred pixels of empty space under its own content. Here every slide is
 * the same lead card, and the row height is whatever that card needs.
 *
 * Motion is left to CSS — the track carries `scroll-smooth` and
 * `motion-reduce:scroll-auto` — so a reader who asks for reduced motion gets an
 * instant jump from the same code path. Scroll position is the source of truth
 * for the current slide, so a touch swipe and an arrow press agree.
 */
export function FeaturedCarousel({
  ideas,
}: {
  ideas: readonly DiscoveryIdea[];
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [syncedIdeas, setSyncedIdeas] = useState(ideas);
  const count = ideas.length;

  // A new featured set (a filter change) must land on its first slide. React's
  // recommended way to reset state from a changed prop is to compare against the
  // previous value during render, not to write state from an effect.
  if (ideas !== syncedIdeas) {
    setSyncedIdeas(ideas);
    setActiveIndex(0);
  }

  useEffect(() => {
    // Assigning `scrollLeft` rather than calling `scrollTo` keeps the motion in
    // CSS (`scroll-smooth`, `motion-reduce:scroll-auto`) and off a DOM API that
    // jsdom does not implement.
    const track = trackRef.current;
    if (track) track.scrollLeft = 0;
  }, [ideas]);

  if (count === 0) return null;

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;

    const clamped = Math.max(0, Math.min(index, count - 1));
    const slide = track.children.item(clamped);
    if (slide instanceof HTMLElement) {
      track.scrollLeft = slide.offsetLeft;
    }
    setActiveIndex(clamped);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;

    const next = Math.max(0, Math.min(restingIndex(track), count - 1));
    setActiveIndex((current) => (current === next ? current : next));
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby="featured-ideas"
      className="py-7 sm:py-9"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Curated discovery
          </p>
          <h2
            id="featured-ideas"
            className="mt-1 text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl"
          >
            Featured this week
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-muted sm:text-sm">
            Paid placement is labelled and never changes validation metrics.
          </p>
        </div>

        {count > 1 ? (
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold tabular-nums text-muted sm:text-sm">
              <span aria-live="polite">
                {activeIndex + 1} of {count}
              </span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous featured idea"
                disabled={activeIndex === 0}
                onClick={() => goTo(activeIndex - 1)}
                className="grid size-11 place-items-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink"
              >
                <HugeiconsIcon
                  icon={ChevronLeftIcon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                aria-label="Next featured idea"
                disabled={activeIndex === count - 1}
                onClick={() => goTo(activeIndex + 1)}
                className="grid size-11 place-items-center rounded-full border border-border bg-surface text-ink transition-colors hover:border-brand/35 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink"
              >
                <HugeiconsIcon
                  icon={ChevronRightIcon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 motion-reduce:scroll-auto"
      >
        {ideas.map((idea, index) => (
          <li
            key={idea.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            className="w-full shrink-0 snap-start"
          >
            <IdeaDiscoveryCard idea={idea} variant="lead" />
          </li>
        ))}
      </ul>

      {count > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {ideas.map((idea, index) => (
            <button
              key={idea.id}
              type="button"
              aria-label={`Go to featured idea ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => goTo(index)}
              className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                index === activeIndex
                  ? "w-6 bg-brand"
                  : "w-2 bg-ink/20 hover:bg-ink/35"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
