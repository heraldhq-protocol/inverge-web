"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, ImageAdd01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { useRef, useState } from "react";

import { useMediaCapabilities } from "@/features/media/components/use-media-capabilities";
import { useMediaUpload } from "@/features/media/components/use-media-upload";
import {
  ACCEPTED_IMAGE_ATTRIBUTE,
  formatBytes,
} from "@/features/media/lib/media-ref";
import {
  MediaUploadError,
  validateImage,
  type UploadedAsset,
  type UploadPurpose,
} from "@/features/media/lib/upload";

const BUTTON_CLASS =
  "inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

/**
 * A compact "add a photo" control for a list of media.
 *
 * It owns no value: on success it hands the verified asset to the caller, which
 * decides whether it becomes a new item, replaces the poster, or is discarded.
 * Keeping the upload here means the list keeps working with links when a
 * deployment has no storage, and gains uploads without changing its shape.
 */
export function MediaUploadButton({
  purpose,
  onUploaded,
  label = "Upload a photo",
  disabled = false,
}: {
  purpose: UploadPurpose;
  onUploaded: (asset: UploadedAsset) => void;
  label?: string;
  disabled?: boolean;
}) {  const { capabilities, loading } = useMediaCapabilities();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const limit = capabilities?.maxImageBytes ?? undefined;
  const uploadsEnabled = capabilities?.uploadsEnabled ?? false;
  const upload = useMediaUpload({ maxBytes: limit, onUploaded, purpose });

  const busyState = upload.state.status === "busy" ? upload.state : null;
  const errorState = upload.state.status === "error" ? upload.state : null;

  function pick(file: File | undefined) {
    if (!file) return;
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

  if (!uploadsEnabled && !loading) {
    return (
      <span className="text-xs leading-5 text-muted">
        File uploads are not enabled on this deployment. Paste a link instead.
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={BUTTON_CLASS}
        disabled={disabled || loading || Boolean(busyState)}
        onClick={() => fileRef.current?.click()}
      >
        <HugeiconsIcon
          aria-hidden="true"
          className="text-muted"
          icon={ImageAdd01Icon}
          size={14}
          strokeWidth={2}
        />
        {loading
          ? "Checking uploads…"
          : busyState
            ? busyState.phase === "verifying"
              ? "Checking the image…"
              : `Uploading ${busyState.percent}%`
            : label}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_ATTRIBUTE}
        className="sr-only"
        disabled={disabled || loading}
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {busyState ? (
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={upload.cancel}
        >
          <HugeiconsIcon
            aria-hidden="true"
            icon={Cancel01Icon}
            size={13}
            strokeWidth={2}
          />
          Cancel
        </button>
      ) : null}

      {errorState || localError ? (
        <span
          role="alert"
          className="inline-flex flex-wrap items-center gap-2 text-xs font-medium text-danger"
        >
          {errorState?.message ?? localError}
          {errorState ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold text-ink underline decoration-border underline-offset-2 hover:decoration-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={upload.retry}
            >
              <HugeiconsIcon
                aria-hidden="true"
                icon={RefreshIcon}
                size={12}
                strokeWidth={2}
              />
              Try again
            </button>
          ) : null}
        </span>
      ) : null}

      {uploadsEnabled && limit ? (
        <span className="text-[0.6875rem] text-muted">
          Up to {formatBytes(limit)}
        </span>
      ) : null}
    </span>
  );
}
