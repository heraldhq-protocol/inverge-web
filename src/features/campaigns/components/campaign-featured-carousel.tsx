"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";

import { CampaignFeaturedBand } from "@/features/campaigns/components/campaign-featured";
import type { Campaign } from "@/features/campaigns/types";

/**
 * Offset of the first slide inside the track.
 *
 * Slides are positioned after the track's inline padding and any negative
 * margin, so their raw `offsetLeft` is not a scroll distance. Subtracting the
 * first slide's offset makes slide one sit at scroll position zero and keeps the
 * inline gutter intact on every viewport.
 */
function firstSlideOffset(track: HTMLElement): number {
  const first = track.children.item(0);
  return first instanceof HTMLElement ? first.offsetLeft : 0;
}

/** Which slide the track is resting on, including after a manual swipe. */
function restingIndex(track: HTMLElement): number {
  let closest = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  const base = firstSlideOffset(track);

  for (let index = 0; index < track.children.length; index += 1) {
    const slide = track.children.item(index);
    if (!(slide instanceof HTMLElement)) continue;

    const distance = Math.abs(slide.offsetLeft - base - track.scrollLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = index;
    }
  }

  return closest;
}

/**
 * Featured campaigns.
 *
 * One featured campaign keeps the single full-width band. More than one becomes
 * a carousel so the band does not turn into a stack of near-identical heroes.
 * The editorial designation is never inferred from performance, and every
 * slide keeps the campaign's real phase and funding block.
 *
 * Scroll position is the source of truth for the current slide, so a touch
 * swipe and an arrow press agree. Motion lives in CSS (`scroll-smooth`,
 * `motion-reduce:scroll-auto`), which gives reduced-motion readers an instant
 * jump through the same code path.
 */
export function CampaignFeaturedCarousel({
  campaigns,
  nowIso,
}: {
  campaigns: readonly Campaign[];
  nowIso: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [syncedCampaigns, setSyncedCampaigns] = useState(campaigns);
  const count = campaigns.length;

  // A changed featured set must land on its first slide. React's recommended
  // way to reset state from a changed prop is to compare during render, not to
  // write state from an effect.
  if (campaigns !== syncedCampaigns) {
    setSyncedCampaigns(campaigns);
    setActiveIndex(0);
  }

  useEffect(() => {
    // Assigning `scrollLeft` keeps the motion in CSS and off `scrollTo`, which
    // jsdom does not implement.
    const track = trackRef.current;
    if (track) track.scrollLeft = 0;
  }, [campaigns]);

  if (count === 0) return null;

  if (count === 1) {
    const campaign = campaigns[0];
    if (!campaign) return null;

    return <CampaignFeaturedBand campaign={campaign} nowIso={nowIso} />;
  }

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;

    const clamped = Math.max(0, Math.min(index, count - 1));
    const slide = track.children.item(clamped);
    if (slide instanceof HTMLElement) {
      track.scrollLeft = slide.offsetLeft - firstSlideOffset(track);
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
      aria-labelledby="featured-campaigns-heading"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
            Curated discovery
          </p>
          <h2
            id="featured-campaigns-heading"
            className="mt-1 text-xl font-bold tracking-[-0.035em] text-ink sm:text-2xl"
          >
            Featured campaigns
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-muted sm:text-sm">
            Editorially selected. Placement never changes a campaign&apos;s
            status or funding figures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold tabular-nums text-muted sm:text-sm">
            <span aria-live="polite">
              {activeIndex + 1} of {count}
            </span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous featured campaign"
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
              aria-label="Next featured campaign"
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
      </div>

      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 motion-reduce:scroll-auto"
      >
        {campaigns.map((campaign, index) => (
          <li
            key={campaign.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            className="w-full shrink-0 snap-start"
          >
            <CampaignFeaturedBand
              campaign={campaign}
              headingId={`featured-campaign-${campaign.id}`}
              nowIso={nowIso}
            />
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {campaigns.map((campaign, index) => (
          <button
            key={campaign.id}
            type="button"
            aria-label={`Go to featured campaign ${index + 1}`}
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
    </section>
  );
}
