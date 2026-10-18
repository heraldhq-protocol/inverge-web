"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  ArrowRight01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { useRef, useState, type KeyboardEvent } from "react";

import { CoverBadge } from "@/components/ui/cover";
import { CampaignVideoPlayer } from "@/features/campaigns/components/campaign-video-player";
import { MediaImage } from "@/features/campaigns/components/media-image";
import type { CampaignMedia } from "@/features/campaigns/types";

/** A deliberate drag, not an accidental brush while scrolling the page. */
const SWIPE_THRESHOLD_PX = 40;

/**
 * The campaign hero gallery.
 *
 * Only the active item is mounted, so a gallery holding a video cannot leave a
 * player running behind the slide a backer is looking at. The controls are real
 * buttons rather than a container-level key handler, because the arrow keys
 * already mean something inside a video player — the handler is bound to the
 * controls instead, where seeking is not in question.
 *
 * A single item renders as a plain image or player with no carousel chrome, so a
 * campaign with one photo does not advertise a gallery that does not exist.
 */
export function CampaignMediaCarousel({
  media,
  label,
  title,
  sizes,
}: {
  media: readonly CampaignMedia[];
  /** Short caption for the chip over the artwork, e.g. a category. */
  label: string;
  /** The campaign title, used to name the gallery for assistive technology. */
  title: string;
  sizes: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const active = media[index] ?? media[0];
  if (!active) return null;

  const position = media.indexOf(active);
  const multiple = media.length > 1;

  function go(target: number) {
    setIndex(Math.max(0, Math.min(media.length - 1, target)));
  }

  function handleNavKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(position - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(position + 1);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface-muted">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title} media`}
        className="relative aspect-video w-full"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          const end = event.changedTouches[0]?.clientX;
          if (start === null || end === undefined) return;

          const delta = end - start;
          if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
          go(delta < 0 ? position + 1 : position - 1);
        }}
      >
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`${position + 1} of ${media.length}`}
          className="absolute inset-0"
        >
          {active.kind === "image" ? (
            <MediaImage
              src={active.src}
              alt={active.alt}
              sizes={sizes}
              className="object-cover"
            />
          ) : (
            <CampaignVideoPlayer media={active} sizes={sizes} />
          )}
        </div>

        <CoverBadge>{label}</CoverBadge>

        {multiple ? (
          <>
            <button
              type="button"
              onClick={() => go(position - 1)}
              onKeyDown={handleNavKeyDown}
              disabled={position === 0}
              aria-label="Show the previous media"
              className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/95 text-ink shadow-sm transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                size={18}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={() => go(position + 1)}
              onKeyDown={handleNavKeyDown}
              disabled={position === media.length - 1}
              aria-label="Show the next media"
              className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/95 text-ink shadow-sm transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={18}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </button>

            <p
              aria-live="polite"
              className="absolute bottom-3 right-3 z-10 rounded-full bg-ink/70 px-2.5 py-1 text-[0.6875rem] font-semibold text-white"
            >
              {position + 1} of {media.length}
            </p>
          </>
        ) : null}
      </div>

      {multiple ? (
        <ul className="flex gap-2 overflow-x-auto px-3 py-3">
          {media.map((item, itemPosition) => (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => go(itemPosition)}
                aria-label={`Show media ${itemPosition + 1} of ${media.length}: ${item.alt}`}
                aria-current={itemPosition === position ? "true" : undefined}
                className={`relative block h-14 w-24 overflow-hidden rounded-xl border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  itemPosition === position
                    ? "border-brand"
                    : "border-border hover:border-border-strong"
                }`}
              >
                {item.kind === "image" ? (
                  <MediaImage
                    src={item.src}
                    alt=""
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center bg-brand/12 text-brand-strong">
                    <HugeiconsIcon
                      icon={Video01Icon}
                      size={16}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
