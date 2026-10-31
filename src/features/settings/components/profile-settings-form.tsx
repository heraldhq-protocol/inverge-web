"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/components/ui/location-picker";
import { Textarea } from "@/components/ui/textarea";
import { AvatarPicker } from "@/features/settings/components/avatar-picker";
import type { SettingsProfile } from "@/features/settings/types";

export function ProfileSettingsForm({
  mode = "preview",
  profile,
}: {
  mode?: "live" | "preview";
  profile: SettingsProfile;
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatarUrl ?? null,
  );
  const [location, setLocation] = useState(profile.location);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "").trim();
    const username = String(form.get("username") ?? "")
      .trim()
      .toLowerCase();

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

    const avatarChanged = (avatarUrl ?? "") !== (profile.avatarUrl ?? "");
    const bio = String(form.get("bio") ?? "").trim();
    const bioChanged = bio !== profile.bio.trim();

    try {
      const response = await fetch("/api/auth/profile", {
        body: JSON.stringify({
          displayName,
          username,
          // Only send a picture the creator actually changed: an unrelated
          // rename must not re-bind (or release) the current one.
          ...(avatarChanged ? { avatarUrl: avatarUrl ?? "" } : {}),
          ...(bioChanged ? { bio } : {}),
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("profile save failed");
      setSaved(true);
      // The picture is rendered by server components (topbar, shell), so the
      // route has to re-read the session before the change is visible there.
      router.refresh();
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
      <div className="border-b border-border pb-5">
        <AvatarPicker
          value={avatarUrl}
          name={profile.displayName}
          onChange={(src) => {
            setAvatarUrl(src);
            setSaved(false);
            setError("");
          }}
          disabled={mode === "preview"}
        />
        <p className="mt-3 font-semibold text-ink">{profile.displayName}</p>
        <p className="mt-0.5 text-xs text-muted">@{profile.username}</p>
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
            htmlFor="settings-bio"
            className="text-sm font-semibold text-ink"
          >
            Bio
          </label>
          <Textarea
            id="settings-bio"
            name="bio"
            defaultValue={profile.bio}
            rows={4}
            maxLength={280}
            placeholder="What you build, who it is for, and why it matters."
          />
          <p className="text-xs text-muted">
            Shown on your public profile. Up to 280 characters.
          </p>
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
