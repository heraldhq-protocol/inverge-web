"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlayIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";

import { MediaImage } from "@/features/campaigns/components/media-image";
import {
  videoEmbedUrl,
  videoFileSrc,
  videoProviderLabel,
} from "@/features/campaigns/lib/media";
import type { CampaignVideo } from "@/features/campaigns/types";

/**
 * A campaign video.
 *
 * A file plays in the browser's own player, because those bytes are media the
 * browser already understands. A YouTube or Vimeo source is a third-party page,
 * so nothing is requested from that host until a backer presses play: the poster
 * is shown first, and only then is the player iframe mounted. That keeps a
 * campaign page free of third-party cookies and unexpected bandwidth, and it
 * respects a reader who never wanted the video to run.
 *
 * The player URL is built from a parsed id by `videoEmbedUrl`, never taken from
 * the creator's input, so this component cannot be pointed at an arbitrary
 * origin.
 *
 * The caller supplies the positioned frame.
 */
export function CampaignVideoPlayer({
  media,
  sizes,
  className = "",
}: {
  media: CampaignVideo;
  sizes: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const fileSrc = videoFileSrc(media.source);
  const embedUrl = videoEmbedUrl(media.source);
  const provider = videoProviderLabel(media.source);

  if (fileSrc) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        className={`absolute inset-0 h-full w-full bg-ink object-cover ${className}`}
        {...(media.poster ? { poster: media.poster } : {})}
      >
        <source src={fileSrc} />
        <a
          href={fileSrc}
          className="text-sm font-semibold text-white underline"
        >
          Open the video file
        </a>
      </video>
    );
  }

  // A hosted video always has a player URL, so this is only a total-function
  // guard; returning nothing is better than rendering an empty frame.
  if (!embedUrl) return null;

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={`Play the ${provider} video: ${media.alt}`}
        className={`group absolute inset-0 h-full w-full ${className}`}
      >
        {media.poster ? (
          <MediaImage
            src={media.poster}
            alt=""
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 bg-brand/12" />
        )}

        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-surface/95 text-ink shadow-lg transition-transform duration-150 group-hover:scale-105">
            <HugeiconsIcon
              icon={PlayIcon}
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
        </span>

        <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white">
          {provider}
        </span>
      </button>
    );
  }

  return (
    <iframe
      src={embedUrl}
      title={media.alt}
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className={`absolute inset-0 h-full w-full border-0 ${className}`}
    />
  );
}
