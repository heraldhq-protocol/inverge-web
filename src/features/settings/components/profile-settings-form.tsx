"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "@/components/ui/location-picker";
import {
  SettingsSaveBar,
  type SettingsSaveState,
} from "@/features/settings/components/settings-save-bar";
import type { SettingsData, SettingsProfile } from "@/features/settings/types";
import { sendJson } from "@/lib/api/client";

export function ProfileSettingsForm({
  profile,
  source,
}: {
  profile: SettingsProfile;
  source: SettingsData["source"];
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [location, setLocation] = useState(profile.location);
  const [saved, setSaved] = useState({ displayName, location, username });
  const [status, setStatus] = useState<SettingsSaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const dirty =
    displayName !== saved.displayName ||
    username !== saved.username ||
    location !== saved.location;
  const readOnly = source !== "api";
  const saveState: SettingsSaveState =
    status === "saving"
      ? "saving"
      : status === "error"
        ? "error"
        : dirty
          ? "dirty"
          : status === "saved"
            ? "saved"
            : "idle";

  function markDirty() {
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || readOnly) return;

    setStatus("saving");
    setErrorMessage("");
    const result = await sendJson<{ saved: boolean }>("/api/settings/profile", {
      body: { displayName, location, username },
      method: "PATCH",
    });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.message);
      return;
    }

    setSaved({ displayName, location, username });
    setStatus("saved");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-2">
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
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              markDirty();
            }}
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
            value={username}
            onChange={(event) => {
              setUsername(event.target.value.toLowerCase());
              markDirty();
            }}
            autoComplete="username"
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9_-]+"
            required
          />
          <p className="text-xs text-muted">inverge.com/u/{username}</p>
        </div>
        <div className="md:col-span-2">
          <LocationPicker
            id="settings-location"
            label="Where you're based"
            help="Only share location detail you are comfortable making public."
            value={location}
            onChange={(next) => {
              setLocation(next);
              markDirty();
            }}
          />
          <input type="hidden" name="location" value={location} />
        </div>
      </div>

      <SettingsSaveBar
        state={saveState}
        errorMessage={errorMessage}
        idleMessage={
          readOnly
            ? "Profile saves need a live account. This preview session is read-only."
            : "Changes are saved to your account."
        }
        savedMessage="Profile saved"
      >
        <Button
          type="submit"
          size="md"
          disabled={!dirty || saveState === "saving" || readOnly}
        >
          Save profile
        </Button>
      </SettingsSaveBar>
    </form>
  );
}
