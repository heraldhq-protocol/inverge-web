"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ImageAdd01Icon } from "@hugeicons/core-free-icons";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { useMediaCapabilities } from "@/features/media/components/use-media-capabilities";
import { useMediaUpload } from "@/features/media/components/use-media-upload";
import {
  ACCEPTED_IMAGE_ATTRIBUTE,
  DEFAULT_IMAGE_MAX_BYTES,
  formatBytes,
} from "@/features/media/lib/media-ref";
import { MediaUploadError, validateImage } from "@/features/media/lib/upload";

/**
 * The profile picture control.
 *
 * A circle, not a frame: an avatar is cropped round everywhere it is shown, so
 * the picker shows exactly what the rest of the app will. The upload itself goes
 * through the same verified pipeline as every other image; this component only
 * decides how the result looks and where it is stored in the form.
 */
export function AvatarPicker({
  value,
  onChange,
  name,
  disabled = false,
}: {
  value: string | null;
  onChange: (src: string | null) => void;
  /** Names the image for assistive tech; the initials fallback stays visual. */
  name?: string | null;
  disabled?: boolean;
}) {
  const { capabilities, loading } = useMediaCapabilities();
  const fileRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const limit = capabilities?.maxImageBytes ?? DEFAULT_IMAGE_MAX_BYTES;
  const uploadsEnabled = capabilities?.uploadsEnabled ?? false;
  const upload = useMediaUpload({
    maxBytes: limit,
    onUploaded: (asset) => onChange(asset.src),
    purpose: "AVATAR",
  });

  const busy = upload.state.status === "busy";
  const locked = disabled || !uploadsEnabled || loading || busy;
  const preview = upload.localPreviewUrl ?? value;

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

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-brand/10 text-lg font-semibold text-brand-strong">
        {preview ? (
          <MediaImage
            src={preview}
            alt={name ? `${name}'s profile picture` : "Profile picture"}
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <HugeiconsIcon
            icon={ImageAdd01Icon}
            size={22}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        )}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGE_ATTRIBUTE}
            className="sr-only"
            onChange={(event) => {
              pick(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={locked}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? "Uploading..." : value ? "Change photo" : "Add a photo"}
          </Button>
          {value && !busy ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                upload.reset();
                setLocalError(null);
                onChange(null);
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>

        <p
          aria-live="polite"
          className="mt-1.5 max-w-sm text-xs leading-5 text-muted"
        >
          {localError ? (
            <span className="text-danger">{localError}</span>
          ) : upload.state.status === "error" ? (
            <span className="text-danger">{upload.state.message}</span>
          ) : upload.state.status === "busy" ? (
            `${upload.state.fileName} · ${upload.state.percent}%`
          ) : loading ? (
            "Checking uploads."
          ) : uploadsEnabled ? (
            `JPEG, PNG or WebP up to ${formatBytes(limit)}.`
          ) : (
            "Uploads are not enabled on this deployment."
          )}
        </p>
      </div>
    </div>
  );
}
