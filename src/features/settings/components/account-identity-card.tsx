"use client";

import { ArrowUpRight, Camera, Check, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";

import { StatusBadge } from "@/components/ui/status-badge";
import { MediaImage } from "@/components/ui/media-image";
import { useMediaUpload } from "@/features/media/components/use-media-upload";
import { DEFAULT_IMAGE_MAX_BYTES } from "@/features/media/lib/media-ref";
import { MediaUploadError, validateImage } from "@/features/media/lib/upload";
import type { SettingsData, SettingsProfile } from "@/features/settings/types";
import { sendJson } from "@/lib/api/client";

export type IdentityBadge = {
  label: string;
  tone: "danger" | "neutral" | "success" | "warning";
};

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words.at(0)?.[0] ?? "";
  const last = words.length > 1 ? (words.at(-1)?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase() || "?";
}

/**
 * The account summary above the settings tabs.
 *
 * It uses the same profile values as the form below and deliberately shows no
 * email address, wallet address, or provider reference. Photo upload runs
 * through the media pipeline; the returned media reference is saved on the
 * profile, and a failed save is reported rather than shown as complete.
 */
export function AccountIdentityCard({
  badge,
  profile,
  source,
}: {
  badge: IdentityBadge;
  profile: SettingsProfile;
  source: SettingsData["source"];
}) {
  const router = useRouter();
  const [photoNotice, setPhotoNotice] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const upload = useMediaUpload({
    maxBytes: DEFAULT_IMAGE_MAX_BYTES,
    purpose: "AVATAR",
    onUploaded: async (asset) => {
      setSavingAvatar(true);
      const result = await sendJson<{ saved: boolean }>(
        "/api/settings/profile",
        { body: { avatarUrl: asset.src }, method: "PATCH" },
      );
      setSavingAvatar(false);
      if (!result.ok) {
        setPhotoNotice(result.message);
        return;
      }
      setPhotoNotice("Profile photo updated.");
      router.refresh();
    },
  });

  const uploadBusy = upload.state.status === "busy" || savingAvatar;
  const uploadError =
    upload.state.status === "error" ? upload.state.message : "";

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || source !== "api") {
      setPhotoNotice(
        "Photo upload needs a live account. This preview is read-only.",
      );
      return;
    }
    setPhotoNotice("");
    try {
      validateImage(file, DEFAULT_IMAGE_MAX_BYTES);
    } catch (error) {
      setPhotoNotice(
        error instanceof MediaUploadError
          ? error.message
          : "That image could not be read.",
      );
      return;
    }
    upload.start(file);
  }

  const preview = upload.localPreviewUrl ?? profile.avatarUrl;

  return (
    <section
      aria-labelledby="account-identity"
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-[0_12px_34px_rgba(13,29,21,0.04)] sm:p-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-brand/[0.055] blur-2xl"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative w-fit shrink-0">
          <div className="relative size-20 overflow-hidden rounded-2xl bg-brand/10 ring-1 ring-border sm:size-[5.5rem]">
            {preview ? (
              <MediaImage
                src={preview}
                alt={profile.displayName || "Profile picture"}
                sizes="88px"
                priority
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-full place-items-center text-xl font-semibold text-brand-strong"
              >
                {initialsFor(profile.displayName)}
              </span>
            )}
            {uploadBusy ? (
              <span className="absolute inset-0 grid place-items-center bg-contrast/45 text-white">
                <Loader2
                  className="size-5 motion-safe:animate-spin"
                  aria-hidden="true"
                />
              </span>
            ) : null}
          </div>
          <input
            id="settings-profile-photo"
            name="profilePhoto"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhotoChange}
            className="sr-only"
          />
          <label
            htmlFor="settings-profile-photo"
            title="Change profile photo"
            className="absolute -bottom-1.5 -right-1.5 grid size-9 cursor-pointer place-items-center rounded-full border border-border bg-surface text-ink shadow-[0_2px_8px_rgba(13,29,21,0.12)] transition-colors hover:border-brand/45 hover:bg-brand-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand"
          >
            <Camera className="size-4" aria-hidden="true" />
            <span className="sr-only">Change profile photo</span>
          </label>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-brand-strong">
            Account identity
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h2
              id="account-identity"
              className="text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl"
            >
              {profile.displayName || "Your profile"}
            </h2>
            {badge.label === "Verified" ? (
              <span
                role="img"
                aria-label="Verified"
                className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-strong"
              >
                <Check
                  className="size-3.5"
                  strokeWidth={2.6}
                  aria-hidden="true"
                />
              </span>
            ) : (
              <StatusBadge variant={badge.tone}>{badge.label}</StatusBadge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {profile.username ? `@${profile.username}` : "Username not set"}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {profile.location || "Location not set"}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          {profile.username ? (
            <Link
              href={`/u/${encodeURIComponent(profile.username)}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border px-3.5 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              View public profile
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
          <p className="text-[0.6875rem] leading-4 text-muted">
            Shown on your public profile
          </p>
        </div>
      </div>

      <p
        aria-live="polite"
        className={`relative mt-3 min-h-4 text-xs ${
          uploadError ? "text-danger" : "text-muted"
        }`}
      >
        {uploadError || photoNotice}
      </p>
    </section>
  );
}
