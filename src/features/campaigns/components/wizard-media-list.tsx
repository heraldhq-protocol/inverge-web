"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  Image01Icon,
  Link01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CampaignVideoPlayer } from "@/features/campaigns/components/campaign-video-player";
import { MediaImage } from "@/features/campaigns/components/media-image";
import { MediaUploadButton } from "@/features/media/components/media-upload-button";
import type { UploadPurpose } from "@/features/media/lib/upload";
import {
  MIN_MEDIA_ALT,
  parseImageSource,
  parseVideoSource,
  videoProviderLabel,
} from "@/features/campaigns/lib/media";
import {
  createDraftMedia,
  type DraftMedia,
} from "@/features/campaigns/lib/wizard";
import type { CampaignMedia } from "@/features/campaigns/types";

/**
 * Media as the wizard edits it: a link, a description, and an order.
 *
 * The source field takes a link rather than a file, because this build has no
 * file storage — the upload control beside the list says so out loud instead of
 * failing quietly. A link is enough to be useful, and it is honest about where
 * the bytes live: a YouTube or Vimeo id is parsed and the player URL is built by
 * `videoEmbedUrl`, so nothing the creator types is handed to an iframe.
 *
 * The preview is built through the same parse the model uses, but a description
 * is not required to see it — a creator should be able to paste a link and check
 * it plays before writing the alt text.
 */

function previewMedia(item: DraftMedia): CampaignMedia | null {
  if (item.kind === "image") {
    const parsed = parseImageSource(item.srcInput);
    if (!parsed.ok) return null;

    return {
      alt: item.alt.trim() || "Media preview",
      caption: null,
      id: item.id,
      kind: "image",
      src: parsed.src,
    };
  }

  const parsed = parseVideoSource(item.srcInput);
  if (!parsed.ok) return null;

  const poster = parseImageSource(item.posterInput);

  return {
    alt: item.alt.trim() || "Media preview",
    caption: null,
    id: item.id,
    kind: "video",
    poster: poster.ok ? poster.src : null,
    source: parsed.source,
  };
}

function sourceStatus(
  item: DraftMedia,
): { message: string; ok: boolean } | null {
  if (!item.srcInput.trim()) return null;

  if (item.kind === "image") {
    const parsed = parseImageSource(item.srcInput);
    return parsed.ok
      ? { message: "Image link accepted.", ok: true }
      : { message: parsed.reason, ok: false };
  }

  const parsed = parseVideoSource(item.srcInput);
  return parsed.ok
    ? { message: `${videoProviderLabel(parsed.source)} recognised.`, ok: true }
    : { message: parsed.reason, ok: false };
}

function MediaDraftRow({
  errorFor,
  fieldPrefix,
  index,
  isPoster,
  item,
  onChange,
  onMove,
  onRemove,
}: {
  errorFor: (field: string) => string | null;
  fieldPrefix: string;
  index: number;
  isPoster: boolean;
  item: DraftMedia;
  onChange: (item: DraftMedia) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const field = `${fieldPrefix}.${item.id}`;
  const status = sourceStatus(item);
  const preview = previewMedia(item);
  const heading = item.kind === "image" ? "Photo" : "Video";

  return (
    <li className="rounded-xl border border-border bg-canvas p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          <HugeiconsIcon
            icon={item.kind === "image" ? Image01Icon : Video01Icon}
            size={13}
            strokeWidth={1.9}
            aria-hidden="true"
          />
          {heading} {index + 1}
          {isPoster ? (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[0.625rem] font-semibold normal-case tracking-normal text-brand-strong">
              Poster
            </span>
          ) : null}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move ${heading.toLowerCase()} ${index + 1} earlier`}
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-border/30 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HugeiconsIcon
              icon={ArrowUp01Icon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            aria-label={`Move ${heading.toLowerCase()} ${index + 1} later`}
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-border/30 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${heading.toLowerCase()} ${index + 1}`}
            className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={13}
              strokeWidth={2}
              aria-hidden="true"
            />
            Remove
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="min-w-0 space-y-3">
          <Field
            label={item.kind === "image" ? "Image link" : "Video link"}
            help={
              item.kind === "image"
                ? "An https link to the image."
                : "A YouTube or Vimeo page, or a direct video file link."
            }
            error={errorFor(field)}
          >
            {({ describedBy, id, invalid }) => (
              <Input
                id={id}
                autoComplete="off"
                inputMode="url"
                placeholder={
                  item.kind === "image"
                    ? "https://example.com/photo.jpg"
                    : "https://www.youtube.com/watch?v=..."
                }
                value={item.srcInput}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                onChange={(event) =>
                  onChange({ ...item, srcInput: event.target.value })
                }
              />
            )}
          </Field>

          {status ? (
            <p
              className={`flex gap-1.5 text-xs leading-5 ${
                status.ok ? "text-brand-strong" : "text-danger"
              }`}
            >
              <HugeiconsIcon
                icon={Link01Icon}
                size={13}
                strokeWidth={1.9}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              {status.message}
            </p>
          ) : (
            <p className="flex gap-1.5 text-xs leading-5 text-muted">
              <HugeiconsIcon
                icon={Link01Icon}
                size={13}
                strokeWidth={1.9}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              Paste a link to attach this {heading.toLowerCase()}.
            </p>
          )}

          <Field
            label="Description"
            help={`At least ${MIN_MEDIA_ALT} characters. Read aloud by a screen reader, so describe what is shown rather than repeating the caption.`}
            error={errorFor(field)}
          >
            {({ describedBy, id, invalid }) => (
              <Input
                id={id}
                autoComplete="off"
                value={item.alt}
                aria-describedby={describedBy || undefined}
                aria-invalid={invalid || undefined}
                onChange={(event) =>
                  onChange({ ...item, alt: event.target.value })
                }
              />
            )}
          </Field>

          <Field label="Caption" optional help="Shown under the media.">
            {({ describedBy, id }) => (
              <Input
                id={id}
                autoComplete="off"
                value={item.caption}
                aria-describedby={describedBy || undefined}
                onChange={(event) =>
                  onChange({ ...item, caption: event.target.value })
                }
              />
            )}
          </Field>

          {item.kind === "video" ? (
            <Field
              label="Poster image"
              optional
              help="The still shown before playback. Without one, the player's own frame is used."
              error={errorFor(field)}
            >
              {({ describedBy, id, invalid }) => (
                <Input
                  id={id}
                  autoComplete="off"
                  inputMode="url"
                  placeholder="/images/ideas/example.jpg"
                  value={item.posterInput}
                  aria-describedby={describedBy || undefined}
                  aria-invalid={invalid || undefined}
                  onChange={(event) =>
                    onChange({ ...item, posterInput: event.target.value })
                  }
                />
              )}
            </Field>
          ) : null}
        </div>

        <div className="relative aspect-video w-full self-start overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface">
          {preview ? (
            preview.kind === "image" ? (
              <MediaImage
                src={preview.src}
                alt=""
                sizes="176px"
                className="object-cover"
              />
            ) : (
              <CampaignVideoPlayer media={preview} sizes="176px" />
            )
          ) : (
            <span className="grid h-full place-items-center px-3 text-center text-[0.6875rem] leading-4 text-muted">
              A preview appears here once the link is valid.
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export function WizardMediaList({
  addNote,
  emptyNote,
  error,
  errorFor,
  fieldPrefix,
  help,
  items,
  legend,
  onChange,
  orderNote,
  upload,
}: {
  /** The list's heading, e.g. "Hero media". */
  legend: string;
  /** What this list is for, in one line. */
  help: string;
  /** Shown when the list is empty. */
  emptyNote: string;
  /** A list-level error, e.g. too many items. */
  error: string | null;
  errorFor: (field: string) => string | null;
  /** `heroMedia` or `storyMedia`; the prefix of every per-item error field. */
  fieldPrefix: string;
  items: DraftMedia[];
  onChange: (items: DraftMedia[]) => void;
  /** Extra guidance shown under the help line, e.g. which item is the poster. */
  orderNote?: string;
  /** A note shown beside the add controls. */
  addNote?: string;
  /**
   * Enables photo upload beside the add controls. A verified upload becomes a
   * normal draft row, so an uploaded photo and a linked one behave identically
   * from here on. Videos are never uploaded: they are linked and played in place.
   */
  upload?: { purpose: UploadPurpose; maxItems: number };
}) {
  function move(from: number, delta: number) {
    const to = from + delta;
    if (to < 0 || to >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <section aria-label={legend} className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-ink">{legend}</p>
        <div className="flex flex-wrap items-center gap-2">
          {upload ? (
            <MediaUploadButton
              disabled={items.length >= upload.maxItems}
              purpose={upload.purpose}
              onUploaded={(asset) =>
                onChange([
                  ...items,
                  {
                    ...createDraftMedia("image"),
                    alt: asset.altText ?? "",
                    srcInput: asset.src,
                  },
                ])
              }
            />
          ) : null}
          {addNote ? (
            <span className="text-xs text-muted">{addNote}</span>
          ) : null}
          <button
            type="button"
            onClick={() => onChange([...items, createDraftMedia("image")])}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Image01Icon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className="text-muted"
            />
            Add a photo
          </button>
          <button
            type="button"
            onClick={() => onChange([...items, createDraftMedia("video")])}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <HugeiconsIcon
              icon={Video01Icon}
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className="text-muted"
            />
            Add a video
          </button>
        </div>
      </div>

      <p className="text-xs leading-5 text-muted">{help}</p>
      {orderNote ? (
        <p className="text-xs leading-5 text-muted">{orderNote}</p>
      ) : null}

      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong bg-canvas px-3.5 py-3 text-xs leading-5 text-muted">
          {emptyNote}
        </p>
      ) : (
        <ul className="mt-1 space-y-3">
          {items.map((item, index) => (
            <MediaDraftRow
              key={item.id}
              errorFor={errorFor}
              fieldPrefix={fieldPrefix}
              index={index}
              isPoster={fieldPrefix === "heroMedia" && index === 0}
              item={item}
              onChange={(next) =>
                onChange(
                  items.map((current) =>
                    current.id === next.id ? next : current,
                  ),
                )
              }
              onMove={(delta) => move(index, delta)}
              onRemove={() =>
                onChange(items.filter((current) => current.id !== item.id))
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}
