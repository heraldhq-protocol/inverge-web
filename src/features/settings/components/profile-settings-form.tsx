"use client";

import { Camera, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SettingsProfile } from "@/features/settings/types";

export function ProfileSettingsForm({ profile }: { profile: SettingsProfile }) {
  const [photoName, setPhotoName] = useState("");
  const [saved, setSaved] = useState(false);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setPhotoName(event.target.files?.[0]?.name ?? "");
    setSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setSaved(false)}
      className="rounded-2xl border border-border bg-surface p-4 shadow-[0_10px_35px_rgba(13,29,21,0.035)] sm:p-5"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-border pb-5 sm:flex sm:flex-wrap">
        <Image
          src="/images/profile_img.png"
          alt="Amara Okonkwo"
          width={80}
          height={80}
          className="size-18 rounded-full object-cover sm:size-20"
          priority
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{profile.displayName}</p>
          <p className="mt-0.5 text-xs text-muted">@{profile.username}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
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
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:border-brand/45 hover:bg-canvas focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand sm:w-auto"
          >
            <Camera className="size-4" aria-hidden="true" />
            Change photo
          </label>
          {photoName ? (
            <p className="mt-1 max-w-44 truncate text-xs text-muted">
              {photoName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="settings-display-name"
            className="text-sm font-semibold text-ink"
          >
            Display name
          </label>
          <Input
            id="settings-display-name"
            name="displayName"
            defaultValue={profile.displayName}
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="settings-username"
            className="text-sm font-semibold text-ink"
          >
            Username
          </label>
          <Input
            id="settings-username"
            name="username"
            defaultValue={profile.username}
            autoComplete="username"
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9-]+"
            required
          />
          <p className="text-xs text-muted">inverge.com/u/{profile.username}</p>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label
            htmlFor="settings-location"
            className="text-sm font-semibold text-ink"
          >
            Where you&apos;re based
          </label>
          <Input
            id="settings-location"
            name="location"
            defaultValue={profile.location}
            autoComplete="address-level2"
          />
          <p className="text-xs text-muted">
            Only share location detail you are comfortable making public.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" size="md">
          Save profile
        </Button>
        <p aria-live="polite" className="text-xs text-muted">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-brand-strong">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Saved for this preview session
            </span>
          ) : (
            "Profile changes are preview-only until account storage is connected."
          )}
        </p>
      </div>
    </form>
  );
}
