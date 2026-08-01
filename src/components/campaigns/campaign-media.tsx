'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Cover } from '@/components/ui/cover';
import type { CampaignDetail } from '@/lib/campaigns/types';

/**
 * The campaign's pitch video, or its cover when there is no video.
 *
 * The reference puts a video player at the top left of every project page and it is the single
 * highest-converting element on it: a creator explaining the plan in their own voice does work that
 * no amount of body copy does, and on a campaign — where money actually moves — that matters more
 * than it does on an idea.
 *
 * Three rules, and they are the reason this is a client component at all:
 *
 * 1. **Never autoplay.** Nothing moves in the viewport at rest (conventions §9.4).
 * 2. **Load nothing until asked.** The poster frame is all that ships on first paint; the `<video>`
 *    element is not mounted until the reader presses play. These pages are read on mid-range Android
 *    over metered data, and a preloaded video is the most expensive thing we could put above the fold.
 * 3. **`controls`, always.** A custom player is a keyboard and screen-reader liability for no gain.
 *
 * With no video the component collapses to the cover, so a campaign without one still reads as a
 * campaign rather than as a broken player.
 */
export function CampaignMedia({ campaign }: { campaign: CampaignDetail }) {
  const [playing, setPlaying] = useState(false);

  // The poster frame the video sits behind. Its own still first, then the campaign's cover art, then
  // the deterministic band, so there is always something to look at before anything loads.
  const poster = campaign.videoPosterUrl ?? campaign.coverImageUrl ?? null;

  const still = (
    <>
      {poster ? (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-cover"
          priority
        />
      ) : (
        <Cover
          id={campaign.id}
          title={campaign.title}
          category={campaign.category}
          topics={campaign.topics}
          ratio="thumbnail"
          className="absolute inset-0 h-full"
        />
      )}
    </>
  );

  return (
    <figure className="space-y-2">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-ink/5">
        {playing ? (
          <video
            src={campaign.videoUrl}
            poster={campaign.videoPosterUrl ?? undefined}
            controls
            autoPlay
            playsInline
            className="h-full w-full bg-ink object-contain"
          >
            <track kind="captions" />
          </video>
        ) : (
          <>
            {still}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex items-center justify-center bg-ink/25 transition-colors hover:bg-ink/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-inset"
            >
              <span className="sr-only">Play the creator&rsquo;s video about {campaign.title}</span>
              <span
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-surface/95 shadow-lift transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              >
                <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-ink">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          </>
        )}
      </div>

      <figcaption className="text-xs text-ink-muted">
        {campaign.creator.displayName} on what this campaign will build. Nothing plays until you press
        play.
      </figcaption>
    </figure>
  );
}
