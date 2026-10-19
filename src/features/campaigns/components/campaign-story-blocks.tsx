import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

import { CampaignVideoPlayer } from "@/features/campaigns/components/campaign-video-player";
import { MediaImage } from "@/features/campaigns/components/media-image";
import {
  videoProviderLabel,
  videoWatchUrl,
} from "@/features/campaigns/lib/media";
import type {
  CampaignImage,
  CampaignVideo,
  StoryBlock,
} from "@/features/campaigns/types";

/**
 * The creator's long-form story.
 *
 * Blocks are data, not markup: every kind here is a component this page chose,
 * with fixed classes, so a creator's text can never introduce a tag, an event
 * handler, or a class the design system does not define. Text keeps the
 * creator's own line breaks, because a creator who separated two paragraphs
 * meant it.
 *
 * Prose is capped at a reading measure while media spans the panel — the point
 * of the tab is that there is finally room for both.
 */

function FigureCaption({ item }: { item: CampaignImage | CampaignVideo }) {
  const watchUrl = item.kind === "video" ? videoWatchUrl(item.source) : null;
  const provider =
    item.kind === "video" ? videoProviderLabel(item.source) : null;

  if (!item.caption && !watchUrl) return null;

  return (
    <figcaption className="mt-2 text-xs leading-5 text-muted">
      {item.caption}
      {item.caption && watchUrl ? " " : null}
      {watchUrl ? (
        <a
          className="font-semibold text-brand-strong underline"
          href={watchUrl}
          rel="noreferrer noopener"
          target="_blank"
        >
          Watch on {provider}
        </a>
      ) : null}
    </figcaption>
  );
}

function MediaFrame({
  item,
  sizes,
}: {
  item: CampaignImage | CampaignVideo;
  sizes: string;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface-muted">
      {item.kind === "image" ? (
        <MediaImage
          alt={item.alt}
          className="object-cover"
          sizes={sizes}
          src={item.src}
        />
      ) : (
        <CampaignVideoPlayer media={item} sizes={sizes} />
      )}
    </div>
  );
}

function StoryBlockView({ block }: { block: StoryBlock }) {
  switch (block.kind) {
    case "heading":
      return (
        <h2 className="text-balance text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl">
          {block.text}
        </h2>
      );

    case "paragraph":
      return (
        <p className="max-w-3xl whitespace-pre-line text-base leading-7 text-ink">
          {block.text}
        </p>
      );

    case "list": {
      const items = block.items
        .map((item, index) => ({ index, text: item.trim() }))
        .filter((item) => item.text.length > 0);
      if (items.length === 0) return null;

      const marker = block.ordered
        ? "list-decimal"
        : "list-disc marker:text-brand";

      return block.ordered ? (
        <ol
          className={`max-w-3xl list-decimal space-y-2 pl-5 text-base leading-7 text-ink ${marker}`}
        >
          {items.map((item) => (
            <li key={item.index}>{item.text}</li>
          ))}
        </ol>
      ) : (
        <ul
          className={`max-w-3xl list-disc space-y-2 pl-5 text-base leading-7 text-ink ${marker}`}
        >
          {items.map((item) => (
            <li key={item.index}>{item.text}</li>
          ))}
        </ul>
      );
    }

    case "quote":
      return (
        <figure className="max-w-3xl border-l-4 border-brand/40 pl-5">
          <blockquote className="text-balance text-lg leading-8 font-medium text-ink">
            {block.text}
          </blockquote>
          {block.attribution ? (
            <figcaption className="mt-2 text-sm text-muted">
              {block.attribution}
            </figcaption>
          ) : null}
        </figure>
      );

    case "note":
      return (
        <aside className="max-w-3xl rounded-2xl border border-brand/25 bg-brand/[0.06] p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={16}
              strokeWidth={1.9}
              aria-hidden="true"
              className="text-brand-strong"
            />
            {block.title}
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-muted">
            {block.text}
          </p>
        </aside>
      );

    case "image":
      return (
        <figure>
          <MediaFrame
            item={block.image}
            sizes="(min-width: 1024px) 800px, 100vw"
          />
          <FigureCaption item={block.image} />
        </figure>
      );

    case "video":
      return (
        <figure>
          <MediaFrame
            item={block.video}
            sizes="(min-width: 1024px) 800px, 100vw"
          />
          <FigureCaption item={block.video} />
        </figure>
      );

    case "gallery":
      return (
        <ul className="grid gap-4 sm:grid-cols-2">
          {block.images.map((image) => (
            <li key={image.id}>
              <figure>
                <MediaFrame
                  item={image}
                  sizes="(min-width: 640px) 360px, 100vw"
                />
                <FigureCaption item={image} />
              </figure>
            </li>
          ))}
        </ul>
      );
  }
}

/** The narrative, in the creator's order. An empty list renders nothing. */
export function CampaignStoryBlocks({
  blocks,
}: {
  blocks: readonly StoryBlock[];
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-7">
      {blocks.map((block) => (
        <StoryBlockView key={block.id} block={block} />
      ))}
    </div>
  );
}
