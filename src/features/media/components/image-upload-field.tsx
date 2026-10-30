"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ImageAdd01Icon,
  RefreshIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/input";
import { MediaImage } from "@/components/ui/media-image";
import { useMediaCapabilities } from "@/features/media/components/use-media-capabilities";
import { useMediaUpload } from "@/features/media/components/use-media-upload";
import {
  ACCEPTED_IMAGE_ATTRIBUTE,
  DEFAULT_IMAGE_MAX_BYTES,
  formatBytes,
} from "@/features/media/lib/media-ref";
import {
  MediaUploadError,
  validateImage,
  type UploadedAsset,
  type UploadPurpose,
} from "@/features/media/lib/upload";

/**
 * One image, with a real upload behind it.
 *
 * The value this field edits is a media reference, not a URL to a bucket: an
 * uploaded image becomes `/api/media/<assetId>` and a link the creator already
 * hosts stays an `https` URL. Nothing here names a provider or a bucket, which
 * is what lets storage move from Supabase to S3 without touching the editor.
 *
 * Removal detaches the image from this field; it does not delete the asset. A
 * cover can be attached to more than one place over its life, and deleting the
 * bytes because one editor dropped a reference would silently break the other.
 * Replaced uploads are cleaned up by the retention pass, not from a click.
 */
export function ImageUploadField({
  value,
  onChange,
  purpose,
  onUploaded,
  disabled = false,
  aspect = "video",
  maxBytes,
  compact = false,
  allowUrlEntry = false,
}: {
  value: string | null;
  onChange: (src: string | null) => void;
  purpose: UploadPurpose;
  /** Runs after a verified upload, e.g. to carry the alt text into a draft. */
  onUploaded?: (asset: UploadedAsset) => void;
  disabled?: boolean;
  /** Matches the frame the image is shown in, so nothing unexpected is cropped. */
  aspect?: "video" | "photo";
  maxBytes?: number;
  /** Hides the empty-state copy for a dense layout. */
  compact?: boolean;
  /**
   * Offers "paste an image address" beside the picker. Needed where the field is
   * the only way to set an image and a deployment may have no storage.
   */
  allowUrlEntry?: boolean;
}) {
  const { capabilities, loading } = useMediaCapabilities();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const limit = maxBytes ?? capabilities?.maxImageBytes ?? DEFAULT_IMAGE_MAX_BYTES;
  const uploadsEnabled = capabilities?.uploadsEnabled ?? false;
  const upload = useMediaUpload({
    maxBytes: limit,
    onUploaded: (asset) => {
      onChange(asset.src);
      onUploaded?.(asset);
    },
    purpose,
  });

  const busy = upload.state.status === "busy";
  const busyState = upload.state.status === "busy" ? upload.state : null;
  const errorState = upload.state.status === "error" ? upload.state : null;
  const preview = upload.localPreviewUrl ?? value;
  const locked = disabled || loading || !uploadsEnabled;

  function pick(file: File | undefined) {
    if (!file || locked) return;
    setLocalError(null);
    try {
      validateImage(file, limit);
    } catch (error) {
      setLocalError(
        error instanceof MediaUploadError
          ? error.message
          : "That image could not be read.",
      );
      return;
    }
    upload.start(file);
  }

  function remove() {
    setLocalError(null);
    upload.reset();
    onChange(null);
  }

  function applyUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    if (!/^https:\/\//i.test(trimmed)) {
      setLocalError("Use an address starting with https://");
      return;
    }
    setLocalError(null);
    upload.reset();
    onChange(trimmed);
    setUrlDraft("");
  }

  return (
    <div>
      <div
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          if (locked || busy) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={(event) => {
          if (locked || busy) return;
          event.preventDefault();
          setDragging(false);
          pick(event.dataTransfer.files?.[0]);
        }}
        className={`relative w-full overflow-hidden rounded-xl border bg-canvas ${
          aspect === "photo" ? "aspect-[3/2]" : "aspect-video"
        } ${
          dragging
            ? "border-brand ring-3 ring-brand/12"
            : preview
              ? "border-border"
              : "border-dashed border-border-strong"
        }`}
      >
        {preview ? (
          <MediaImage
            src={preview}
            alt=""
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
          />
        ) : null}

        {busyState ? (
          <div className="absolute inset-0 flex flex-col justify-end bg-ink/35 p-3">
            <div
              aria-label="Upload progress"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={busyState.percent}
              className="h-1.5 w-full overflow-hidden rounded-full bg-white/30"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200"
                style={{ width: `${busyState.percent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-white">
                {busyState.phase === "requesting"
                  ? "Preparing the upload…"
                  : busyState.phase === "verifying"
                    ? "Checking the image…"
                    : `Uploading ${busyState.percent}%`}
              </p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={upload.cancel}
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={Cancel01Icon}
                  size={14}
                  strokeWidth={2}
                />
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {!preview && !busy ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={locked}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 text-center transition-colors hover:bg-brand/[0.04] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="text-muted"
              icon={uploadsEnabled ? ImageAdd01Icon : Upload01Icon}
              size={22}
              strokeWidth={1.6}
            />
            <span className="text-sm font-medium text-ink">
              {loading
                ? "Checking uploads…"
                : uploadsEnabled
                  ? "Add a photo"
                  : "Uploads are not enabled here"}
            </span>
            {!compact ? (
              <span className="max-w-72 text-xs leading-relaxed text-muted">
                {uploadsEnabled
                  ? `Drop a file here, or choose one. JPEG, PNG or WebP up to ${formatBytes(limit)}.`
                  : "Paste a link instead if this deployment has no media storage."}
              </span>
            ) : null}
          </button>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_ATTRIBUTE}
        className="sr-only"
        disabled={locked}
        onChange={(event) => {
          pick(event.target.files?.[0]);
          // Reset so choosing the same file again still fires a change event.
          event.target.value = "";
        }}
      />

      {allowUrlEntry && !preview ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            type="url"
            inputMode="url"
            value={urlDraft}
            placeholder="…or paste an image address (https://)"
            aria-label="Image address"
            className={`${inputClass} min-w-0 flex-1`}
            onChange={(event) => setUrlDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              applyUrl();
            }}
          />
          <Button size="sm" type="button" variant="outline" onClick={applyUrl}>
            Use link
          </Button>
        </div>
      ) : null}

      {localError ? (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
          {localError}
        </p>
      ) : null}

      {errorState ? (
        <div
          role="alert"
          className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-danger/30 bg-danger/[0.04] px-3 py-2"
        >
          <p className="text-xs leading-relaxed text-danger">
            {errorState.message}
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" type="button" variant="secondary" onClick={upload.retry}>
              <HugeiconsIcon
                aria-hidden="true"
                icon={RefreshIcon}
                size={14}
                strokeWidth={2}
              />
              Try again
            </Button>
            <Button size="sm" type="button" variant="ghost" onClick={upload.reset}>
              Dismiss
            </Button>
          </div>
        </div>
      ) : null}

      {preview && !busy ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            type="button"
            variant="outline"
            disabled={locked}
            onClick={() => fileRef.current?.click()}
          >
            <HugeiconsIcon
              aria-hidden="true"
              icon={Upload01Icon}
              size={14}
              strokeWidth={2}
            />
            Replace
          </Button>
          <Button
            size="sm"
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={remove}
          >
            Remove
          </Button>
        </div>
      ) : null}
    </div>
  );
}
