"use client";

import { Camera, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/components/ui/location-picker";
import type { SettingsProfile } from "@/features/settings/types";

export function ProfileSettingsForm({
  mode = "preview",
  profile,
}: {
  mode?: "live" | "preview";
  profile: SettingsProfile;
}) {
  const [photoName, setPhotoName] = useState("");
  const [location, setLocation] = useState(profile.location);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    setPhotoName(event.target.files?.[0]?.name ?? "");
    setSaved(false);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "").trim();
    const username = String(form.get("username") ?? "").trim().toLowerCase();

    if (!displayName || username.length < 3) {
      setError("Add a display name and a username of at least 3 characters.");
      setSaved(false);
      return;
    }

    if (mode === "preview") {
      setError("");
      setSaved(true);
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch("/api/auth/profile", {
        body: JSON.stringify({ displayName, username }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("profile save failed");
      setSaved(true);
    } catch {
      setError("We couldn't save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => {
        setSaved(false);
        setError("");
      }}
      className="rounded-2xl border border-border bg-surface p-4 shadow-[0_10px_35px_rgba(13,29,21,0.035)] sm:p-5"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-border pb-5 sm:flex sm:flex-wrap">
        <Image
          src={profile.avatarUrl || "/images/profile_img.png"}
          alt={profile.displayName || "Your profile"}
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
        <div className="md:col-span-2">
          <LocationPicker
            id="settings-location"
            label="Where you're based"
            help="Only share location detail you are comfortable making public."
            value={location}
            onChange={setLocation}
          />
          <input type="hidden" name="location" value={location} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" size="md" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </Button>
        <p aria-live="polite" className="text-xs text-muted">
          {error ? (
            <span className="text-danger">{error}</span>
          ) : saved ? (
            <span className="inline-flex items-center gap-1.5 text-brand-strong">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              {mode === "live"
                ? "Profile saved to your Inverge account"
                : "Saved for this preview session"}
            </span>
          ) : mode === "live" ? (
            "Changes are saved through the API and reflected across your account."
          ) : (
            "Profile changes are preview-only until account storage is connected."
          )}
        </p>
      </div>
    </form>
  );
}
